"""Dashboard API."""

from fastapi import APIRouter, Depends
from bson import ObjectId

from api.auth import get_current_user
from db.mongodb import get_database

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=dict)
async def get_summary(user: dict = Depends(get_current_user)):
    """Dashboard summary: stats, risk distribution, score changes, revenue at risk."""
    db = get_database()
    user_id = user["_id"]
    accounts = await db.accounts.find(
        {"user_id": user_id, "status": "active"}
    ).to_list(length=500)
    total = len(accounts)
    critical = sum(1 for a in accounts if (a.get("current_health_score") or 100) <= 30)
    attention = sum(1 for a in accounts if 30 < (a.get("current_health_score") or 0) <= 60)
    healthy = sum(1 for a in accounts if (a.get("current_health_score") or 0) > 60)
    revenue_at_risk = sum(
        a.get("monthly_revenue") or 0
        for a in accounts
        if (a.get("current_health_score") or 100) <= 30
    )
    risk_dist = {
        "critical": critical,
        "high": sum(1 for a in accounts if a.get("current_risk_level") == "high"),
        "elevated": sum(1 for a in accounts if a.get("current_risk_level") == "elevated"),
        "attention": attention,
        "healthy": healthy,
        "champion": sum(1 for a in accounts if a.get("current_risk_level") == "champion"),
    }
    scores_with_prev = await db.health_scores.aggregate([
        {"$match": {"user_id": user_id}},
        {"$sort": {"calculated_at": -1}},
        {"$group": {"_id": "$account_id", "scores": {"$push": "$$ROOT"}}},
    ]).to_list(length=500)
    biggest_drops = []
    biggest_gains = []
    for g in scores_with_prev:
        scores = g.get("scores", [])
        if len(scores) < 2:
            continue
        curr = scores[0].get("score", 0)
        prev = scores[1].get("score", 0)
        change = curr - prev
        acc_name = scores[0].get("account_name", "")
        if change < 0:
            biggest_drops.append({"account": acc_name, "from": prev, "to": curr, "change": change})
        elif change > 0:
            biggest_gains.append({"account": acc_name, "from": prev, "to": curr, "change": change})
    biggest_drops.sort(key=lambda x: x["change"])[:5]
    biggest_gains.sort(key=lambda x: -x["change"])[:3]
    return {
        "success": True,
        "data": {
            "total_accounts": total,
            "critical_count": critical,
            "attention_count": attention,
            "healthy_count": healthy,
            "revenue_at_risk": revenue_at_risk,
            "risk_distribution": risk_dist,
            "biggest_drops": biggest_drops[:5],
            "biggest_gains": biggest_gains[:3],
        },
    }


@router.get("/alerts", response_model=dict)
async def get_alerts(
    user: dict = Depends(get_current_user),
    limit: int = 20,
):
    """Get recent alerts."""
    db = get_database()
    cursor = db.alerts.find(
        {"user_id": user["_id"]}
    ).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    unread = await db.alerts.count_documents(
        {"user_id": user["_id"], "read": False}
    )
    return {
        "success": True,
        "data": {
            "alerts": [
                {
                    "id": str(a["_id"]),
                    "type": a.get("type"),
                    "title": a.get("title"),
                    "message": a.get("message"),
                    "severity": a.get("severity"),
                    "read": a.get("read", False),
                    "created_at": a.get("created_at").isoformat() if a.get("created_at") else None,
                }
                for a in items
            ],
            "unread_count": unread,
        },
    }


@router.put("/alerts/{alert_id}/read", response_model=dict)
async def mark_alert_read(
    alert_id: str,
    user: dict = Depends(get_current_user),
):
    """Mark alert as read."""
    db = get_database()
    await db.alerts.update_one(
        {"_id": ObjectId(alert_id), "user_id": user["_id"]},
        {"$set": {"read": True}},
    )
    return {"success": True}
