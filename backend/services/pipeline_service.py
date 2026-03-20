"""Batch health score recalculation pipeline."""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any
from uuid import uuid4

from bson import ObjectId

from db.mongodb import get_database
from services.score_engine import (
    calculate_ticket_signal,
    calculate_nps_signal,
    calculate_usage_signal,
    calculate_support_velocity,
)
from services.ai_service import get_ai_service
from services.alert_service import create_alert
from config import settings

logger = logging.getLogger(__name__)

# In-memory job store (use Redis in production)
recalc_jobs: dict[str, dict] = {}


def _format_ticket_section(tickets: list, ticket_score: dict, velocity: str) -> str:
    lines = [
        f"Total tickets: {len(tickets)}",
        f"Ticket velocity: {velocity}",
        f"Pre-calculated ticket signal score: {ticket_score.get('score', 50)}/100",
        "",
        "Tickets:",
    ]
    for t in tickets[:20]:
        created = t.get("created_date", "")
        if isinstance(created, datetime):
            created = created.strftime("%Y-%m-%d")
        lines.append(
            f"- [{created}] Subject: \"{t.get('subject', '')}\" | "
            f"Status: {t.get('status', '')} | CSAT: {t.get('satisfaction_score', '')}/5 | "
            f"AI Sentiment: {t.get('ai_sentiment', '')} | Churn signals: {t.get('ai_churn_signals', [])}"
        )
    if len(tickets) > 20:
        lines.append(f"... and {len(tickets) - 20} more")
    return "\n".join(lines)


def _format_nps_section(responses: list, nps_score: dict) -> str:
    if not responses:
        return "No NPS data"
    latest = max(responses, key=lambda r: r.get("date") or datetime.min)
    prev = None
    if len(responses) > 1:
        sorted_r = sorted(
            responses,
            key=lambda r: r.get("date") or datetime.min,
            reverse=True,
        )
        prev = sorted_r[1]
    delta = ""
    if prev:
        delta = f" (change: {latest.get('score', 0) - prev.get('score', 0)})"
    return (
        f"Latest NPS: {latest.get('score')}/10 ({latest.get('nps_category', '')}){delta}\n"
        f"Pre-calculated NPS signal: {nps_score.get('score', 50)}/100\n"
        f"Feedback: \"{latest.get('feedback', '')}\""
    )


def _format_usage_section(events: list, usage_score: dict) -> str:
    if not events:
        return "No usage data"
    lines = [f"Pre-calculated usage signal: {usage_score.get('score', 50)}/100"]
    for e in events[:10]:
        lines.append(
            f"- {e.get('event_type')}: {e.get('count_current')} (was {e.get('count_previous')}) "
            f"— {e.get('change_pct', 0):.1f}% | Trend: {e.get('engagement_trend', '')}"
        )
    return "\n".join(lines)


async def run_recalculation(user_id: ObjectId) -> str:
    """Start batch recalculation. Returns job_id."""
    job_id = str(uuid4())
    db = get_database()
    accounts = await db.accounts.find(
        {"user_id": user_id, "status": "active"}
    ).to_list(length=500)
    total = len(accounts)
    recalc_jobs[job_id] = {
        "job_id": job_id,
        "status": "running",
        "progress_pct": 0,
        "current_account": "",
        "accounts_processed": 0,
        "total_accounts": total,
        "new_critical_count": 0,
        "errors": [],
        "started_at": datetime.utcnow().isoformat(),
        "estimated_remaining_seconds": total * 5,
    }
    asyncio.create_task(_run_pipeline(job_id, user_id, accounts))
    return job_id


async def _run_pipeline(
    job_id: str, user_id: ObjectId, accounts: list[dict]
) -> None:
    db = get_database()
    ai_service = None
    if settings.gemini_api_key:
        ai_service = get_ai_service()
    total = len(accounts)
    new_critical = 0
    errors: list[str] = []
    sem = asyncio.Semaphore(settings.max_concurrent_ai_calls)

    for i, acc in enumerate(accounts):
        recalc_jobs[job_id]["current_account"] = acc.get("account_name", "")
        recalc_jobs[job_id]["accounts_processed"] = i
        recalc_jobs[job_id]["progress_pct"] = int((i / total) * 100) if total else 0

        try:
            acc_id = acc["_id"]
            now = datetime.utcnow()
            cutoff = now - timedelta(days=30)

            tickets = await db.tickets.find(
                {"account_id": acc_id, "created_date": {"$gte": cutoff}}
            ).to_list(length=500)
            nps = await db.nps_responses.find({"account_id": acc_id}).to_list(
                length=100
            )
            usage = await db.usage_events.find(
                {"account_id": acc_id, "date": {"$gte": cutoff}}
            ).to_list(length=100)
            if not usage:
                usage = await db.usage_events.find({"account_id": acc_id}).to_list(
                    length=100
                )

            ticket_signal = calculate_ticket_signal(tickets)
            nps_signal = calculate_nps_signal(nps)
            usage_signal = calculate_usage_signal(usage)
            velocity = calculate_support_velocity(tickets)

            account_data = {
                "account_name": acc.get("account_name"),
                "company_size": acc.get("company_size"),
                "plan_tier": acc.get("plan_tier"),
                "monthly_revenue": acc.get("monthly_revenue"),
                "contract_renewal_date": str(acc.get("contract_renewal_date", "")),
                "ticket_section": _format_ticket_section(
                    tickets, ticket_signal, velocity
                ),
                "nps_section": _format_nps_section(nps, nps_signal),
                "usage_section": _format_usage_section(usage, usage_signal),
                "velocity_section": f"Velocity: {velocity}",
            }

            if ai_service:
                result = await ai_service.calculate_health_score(account_data)
                await asyncio.sleep(0.5)
            else:
                result = _fallback_score(ticket_signal, nps_signal, usage_signal)

            score = result.get("health_score", 50)
            risk_level = result.get("risk_level", "attention")
            prev_score = acc.get("current_health_score")
            score_change = (score - prev_score) if prev_score is not None else None

            if score <= 30 and (prev_score is None or prev_score > 30):
                new_critical += 1
                await create_alert(
                    db,
                    user_id,
                    acc_id,
                    "new_critical",
                    f"NEW CRITICAL: {acc.get('account_name')} score dropped to {score}",
                    "critical",
                )

            health_doc = {
                "user_id": user_id,
                "account_id": acc_id,
                "account_name": acc.get("account_name"),
                "score": score,
                "risk_level": risk_level,
                "confidence": result.get("confidence", "medium"),
                "score_breakdown": result.get("score_breakdown", {}),
                "risk_factors": result.get("risk_factors", []),
                "positive_signals": result.get("positive_signals", []),
                "recommended_actions": [
                    {**a, "status": "pending", "completed_at": None, "notes": None}
                    for a in result.get("recommended_actions", [])
                ],
                "churn_prediction": result.get("churn_prediction", {}),
                "account_summary": result.get("account_summary", ""),
                "raw_signals_snapshot": {
                    "ticket_signal_score": ticket_signal.get("score"),
                    "nps_signal_score": nps_signal.get("score"),
                    "usage_signal_score": usage_signal.get("score"),
                    "support_velocity": velocity,
                },
                "previous_score": prev_score,
                "score_change": score_change,
                "calculated_at": now,
            }
            await db.health_scores.insert_one(health_doc)

            await db.accounts.update_one(
                {"_id": acc_id},
                {
                    "$set": {
                        "current_health_score": score,
                        "current_risk_level": risk_level,
                        "last_score_calculated_at": now,
                        "updated_at": now,
                    }
                },
            )

        except Exception as e:
            logger.exception("Recalc error for account %s", acc.get("account_name"))
            errors.append(f"{acc.get('account_name')}: {str(e)}")
        await asyncio.sleep(0.5)

    recalc_jobs[job_id].update(
        {
            "status": "completed",
            "progress_pct": 100,
            "accounts_processed": total,
            "new_critical_count": new_critical,
            "errors": errors,
        }
    )


def _fallback_score(
    ticket_signal: dict, nps_signal: dict, usage_signal: dict
) -> dict:
    """Rule-based fallback when AI unavailable."""
    t = ticket_signal.get("score", 50)
    n = nps_signal.get("score", 50)
    u = usage_signal.get("score", 50)
    score = (t * 0.4 + n * 0.3 + u * 0.3)
    if score <= 30:
        risk = "critical" if score <= 15 else "high"
    elif score <= 50:
        risk = "elevated"
    elif score <= 70:
        risk = "attention"
    elif score <= 85:
        risk = "healthy"
    else:
        risk = "champion"
    return {
        "health_score": round(score),
        "risk_level": risk,
        "confidence": "low",
        "score_breakdown": {},
        "risk_factors": [],
        "positive_signals": [],
        "recommended_actions": [],
        "churn_prediction": {},
        "account_summary": "Score computed without AI analysis.",
    }
