"""Raw signal computation for health score (no AI)."""

from datetime import datetime, timedelta
from typing import Any


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def calculate_ticket_signal(tickets: list[dict]) -> dict[str, Any]:
    """Compute ticket signal score 0-100."""
    if not tickets:
        return {"score": 80, "label": "No recent tickets"}

    volume_score = 100 - (len(tickets) * 15)
    volume_score = clamp(volume_score, 0, 100)

    sentiment_weights = {
        "positive": 0,
        "neutral": -5,
        "frustrated": -15,
        "angry": -25,
        "exit_intent": -40,
    }
    sentiment_penalty = sum(
        sentiment_weights.get(t.get("ai_sentiment", "neutral"), -5)
        for t in tickets
    )

    unresolved = sum(
        1
        for t in tickets
        if str(t.get("status", "")).lower() in ("open", "in progress")
    )
    resolution_penalty = unresolved * -10

    csat_scores = [
        t["satisfaction_score"]
        for t in tickets
        if t.get("satisfaction_score") is not None
    ]
    avg_csat = sum(csat_scores) / len(csat_scores) if csat_scores else 3
    csat_component = (avg_csat / 5) * 20

    has_exit = any(t.get("ai_sentiment") == "exit_intent" for t in tickets)
    has_cancel = any(
        "cancel" in str(t.get("subject", "")).lower()
        or "alternative" in str(t.get("subject", "")).lower()
        for t in tickets
    )
    churn_penalty = -30 if (has_exit or has_cancel) else 0

    raw = 80 + sentiment_penalty + resolution_penalty + csat_component + churn_penalty + (volume_score - 80)
    return {"score": clamp(raw, 0, 100), "label": "Computed"}


def calculate_nps_signal(responses: list[dict]) -> dict[str, Any]:
    """Compute NPS signal score 0-100."""
    if not responses:
        return {"score": 50, "label": "No NPS data"}

    latest = max(responses, key=lambda r: r.get("date") or datetime.min)
    base_score = (latest.get("score", 5) or 5) * 10

    prev = None
    if len(responses) > 1:
        sorted_r = sorted(
            responses,
            key=lambda r: r.get("date") or datetime.min,
            reverse=True,
        )
        prev = sorted_r[1] if len(sorted_r) > 1 else None
    trend_adj = 0
    if prev:
        trend_adj = (latest.get("score", 5) - prev.get("score", 5)) * 5

    sentiment_adj = 0
    if latest.get("ai_sentiment"):
        adj_map = {
            "positive": 5,
            "neutral": 0,
            "frustrated": -10,
            "angry": -15,
            "exit_intent": -25,
        }
        sentiment_adj = adj_map.get(latest["ai_sentiment"], 0)

    return {"score": clamp(base_score + trend_adj + sentiment_adj, 0, 100)}


def calculate_usage_signal(events: list[dict]) -> dict[str, Any]:
    """Compute usage signal score 0-100."""
    if not events:
        return {"score": 50, "label": "No usage data"}

    login_events = [e for e in events if "login" in str(e.get("event_type", "")).lower()]
    login_changes = [e.get("change_pct", 0) for e in login_events if e.get("change_pct") is not None]
    login_pct = sum(login_changes) / len(login_changes) if login_changes else 0

    user_changes = [e.get("active_users_change_pct") for e in events if e.get("active_users_change_pct") is not None]
    user_pct = sum(user_changes) / len(user_changes) if user_changes else 0

    content = [e for e in events if "login" not in str(e.get("event_type", "")).lower()]
    content_changes = [e.get("change_pct", 0) for e in content if e.get("change_pct") is not None]
    content_pct = sum(content_changes) / len(content_changes) if content_changes else 0

    usage_score = 50 + (login_pct * 0.3) + (user_pct * 0.3) + (content_pct * 0.4)
    return {"score": clamp(usage_score, 0, 100)}


def calculate_support_velocity(tickets: list[dict]) -> str:
    """Compare ticket count last 14 days vs 14-28 days ago."""
    now = datetime.utcnow()
    recent_start = now - timedelta(days=14)
    prev_start = now - timedelta(days=28)
    recent_count = sum(
        1
        for t in tickets
        if t.get("created_date")
        and (t["created_date"] if isinstance(t["created_date"], datetime) else datetime.min) >= recent_start
    )
    prev_count = sum(
        1
        for t in tickets
        if t.get("created_date")
        and prev_start
        <= (t["created_date"] if isinstance(t["created_date"], datetime) else datetime.min)
        < recent_start
    )
    if prev_count == 0 and recent_count > 0:
        return "increasing"
    if prev_count == 0:
        return "stable"
    velocity_change = ((recent_count - prev_count) / prev_count) * 100
    if velocity_change > 50:
        return "spiking"
    if velocity_change > 0:
        return "increasing"
    if velocity_change == 0:
        return "stable"
    if velocity_change > -30:
        return "decreasing"
    return "quiet"
