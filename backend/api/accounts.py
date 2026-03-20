"""Accounts API."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from api.auth import get_current_user
from db.mongodb import get_database

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("", response_model=dict)
async def list_accounts(
    user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    sort: str = Query("current_health_score"),
    order: str = Query("asc"),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """List accounts with pagination and filters."""
    db = get_database()
    user_id = user["_id"]
    match: dict = {"user_id": user_id, "status": "active"}
    if risk_level:
        match["current_risk_level"] = risk_level
    if search:
        match["$or"] = [
            {"account_name": {"$regex": search, "$options": "i"}},
            {"account_name_normalized": {"$regex": search.lower(), "$options": "i"}},
        ]
    sort_dir = 1 if order == "asc" else -1
    cursor = (
        db.accounts.find(match)
        .sort(sort, sort_dir)
        .skip((page - 1) * per_page)
        .limit(per_page)
    )
    items = await cursor.to_list(length=per_page)
    total = await db.accounts.count_documents(match)
    return {
        "success": True,
        "data": [
            {
                "id": str(a["_id"]),
                "account_name": a.get("account_name"),
                "company_size": a.get("company_size"),
                "plan_tier": a.get("plan_tier"),
                "monthly_revenue": a.get("monthly_revenue"),
                "contract_renewal_date": a.get("contract_renewal_date").isoformat() if a.get("contract_renewal_date") else None,
                "current_health_score": a.get("current_health_score"),
                "current_risk_level": a.get("current_risk_level"),
                "last_score_calculated_at": a.get("last_score_calculated_at").isoformat() if a.get("last_score_calculated_at") else None,
            }
            for a in items
        ],
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page,
        },
    }


@router.get("/{account_id}", response_model=dict)
async def get_account(
    account_id: str,
    user: dict = Depends(get_current_user),
):
    """Get full account detail with latest score."""
    db = get_database()
    acc = await db.accounts.find_one(
        {"_id": ObjectId(account_id), "user_id": user["_id"]}
    )
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    latest = await db.health_scores.find_one(
        {"account_id": acc["_id"]},
        sort=[("calculated_at", -1)],
    )
    latest_data = None
    if latest:
        latest_data = {
            "score": latest.get("score"),
            "risk_level": latest.get("risk_level"),
            "risk_factors": latest.get("risk_factors", []),
            "recommended_actions": latest.get("recommended_actions", []),
            "account_summary": latest.get("account_summary"),
            "churn_prediction": latest.get("churn_prediction", {}),
        }
    return {
        "success": True,
        "data": {
            "id": str(acc["_id"]),
            "account_name": acc.get("account_name"),
            "company_size": acc.get("company_size"),
            "industry": acc.get("industry"),
            "plan_tier": acc.get("plan_tier"),
            "monthly_revenue": acc.get("monthly_revenue"),
            "contract_renewal_date": acc.get("contract_renewal_date"),
            "primary_contact": acc.get("primary_contact", {}),
            "tags": acc.get("tags", []),
            "current_health_score": acc.get("current_health_score"),
            "current_risk_level": acc.get("current_risk_level"),
            "latest_score": latest_data,
        },
    }


@router.get("/{account_id}/tickets", response_model=dict)
async def get_account_tickets(
    account_id: str,
    user: dict = Depends(get_current_user),
):
    """Get tickets for account."""
    db = get_database()
    acc = await db.accounts.find_one(
        {"_id": ObjectId(account_id), "user_id": user["_id"]}
    )
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    cursor = db.tickets.find({"account_id": acc["_id"]}).sort("created_date", -1).limit(100)
    items = await cursor.to_list(length=100)
    return {
        "success": True,
        "data": [
            {
                "id": str(t["_id"]),
                "subject": t.get("subject"),
                "status": t.get("status"),
                "ai_sentiment": t.get("ai_sentiment"),
                "satisfaction_score": t.get("satisfaction_score"),
                "created_date": t.get("created_date").isoformat() if t.get("created_date") else None,
            }
            for t in items
        ],
    }


@router.get("/{account_id}/nps", response_model=dict)
async def get_account_nps(
    account_id: str,
    user: dict = Depends(get_current_user),
):
    """Get NPS responses for account."""
    db = get_database()
    acc = await db.accounts.find_one(
        {"_id": ObjectId(account_id), "user_id": user["_id"]}
    )
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    cursor = db.nps_responses.find({"account_id": acc["_id"]}).sort("date", -1).limit(50)
    items = await cursor.to_list(length=50)
    return {
        "success": True,
        "data": [
            {
                "id": str(n["_id"]),
                "score": n.get("score"),
                "nps_category": n.get("nps_category"),
                "feedback": n.get("feedback"),
                "date": n.get("date").isoformat() if n.get("date") else None,
            }
            for n in items
        ],
    }


@router.get("/{account_id}/usage", response_model=dict)
async def get_account_usage(
    account_id: str,
    user: dict = Depends(get_current_user),
):
    """Get usage events for account."""
    db = get_database()
    acc = await db.accounts.find_one(
        {"_id": ObjectId(account_id), "user_id": user["_id"]}
    )
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    cursor = db.usage_events.find({"account_id": acc["_id"]}).sort("date", -1).limit(50)
    items = await cursor.to_list(length=50)
    return {
        "success": True,
        "data": [
            {
                "id": str(u["_id"]),
                "event_type": u.get("event_type"),
                "count_current": u.get("count_current"),
                "count_previous": u.get("count_previous"),
                "change_pct": u.get("change_pct"),
                "engagement_trend": u.get("engagement_trend"),
            }
            for u in items
        ],
    }


@router.get("/{account_id}/score-history", response_model=dict)
async def get_score_history(
    account_id: str,
    user: dict = Depends(get_current_user),
):
    """Get score history for trend chart."""
    db = get_database()
    acc = await db.accounts.find_one(
        {"_id": ObjectId(account_id), "user_id": user["_id"]}
    )
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    cursor = db.health_scores.find(
        {"account_id": acc["_id"]}
    ).sort("calculated_at", 1).limit(100)
    items = await cursor.to_list(length=100)
    return {
        "success": True,
        "data": [
            {
                "score": s.get("score"),
                "risk_level": s.get("risk_level"),
                "calculated_at": s.get("calculated_at").isoformat() if s.get("calculated_at") else None,
            }
            for s in items
        ],
    }
