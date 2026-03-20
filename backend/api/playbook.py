"""Playbook API - aggregated retention actions."""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import csv
import io

from api.auth import get_current_user
from db.mongodb import get_database

router = APIRouter(prefix="/api/playbook", tags=["playbook"])


async def _fetch_playbook_data(user_id):
    """Fetch playbook data for user."""
    db = get_database()
    scores = await db.health_scores.aggregate([
        {"$match": {"user_id": user_id}},
        {"$sort": {"calculated_at": -1}},
        {"$group": {"_id": "$account_id", "doc": {"$first": "$$ROOT"}}},
    ]).to_list(length=500)
    this_week = []
    this_month = []
    for s in scores:
        doc = s.get("doc", {})
        actions = doc.get("recommended_actions", [])
        acc_name = doc.get("account_name", "")
        score_val = doc.get("score", 0)
        risk = doc.get("risk_level", "")
        for a in actions:
            if a.get("status") in ("completed", "dismissed"):
                continue
            item = {
                "account_id": str(doc.get("account_id")),
                "account_name": acc_name,
                "score": score_val,
                "risk_level": risk,
                "action_id": a.get("id"),
                "title": a.get("title"),
                "description": a.get("description"),
                "type": a.get("type"),
                "urgency": a.get("urgency"),
                "expected_impact": a.get("expected_impact"),
                "talk_track": a.get("talk_track"),
            }
            if a.get("urgency") == "this_week":
                this_week.append(item)
            else:
                this_month.append(item)
    return {"this_week": this_week, "this_month": this_month}


@router.get("", response_model=dict)
async def get_playbook(user: dict = Depends(get_current_user)):
    """Get all pending actions across at-risk accounts, grouped by urgency."""
    data = await _fetch_playbook_data(user["_id"])
    return {
        "success": True,
        "data": data,
    }


@router.get("/stats", response_model=dict)
async def get_playbook_stats(user: dict = Depends(get_current_user)):
    """Playbook statistics."""
    data = await _fetch_playbook_data(user["_id"])
    pending = len(data["this_week"]) + len(data["this_month"])
    accounts = len(set(a["account_id"] for a in data["this_week"] + data["this_month"]))
    return {
        "success": True,
        "data": {
            "actions_pending": pending,
            "accounts_with_actions": accounts,
        },
    }


@router.get("/export")
async def export_playbook(user: dict = Depends(get_current_user)):
    """Export playbook as CSV."""
    data = await _fetch_playbook_data(user["_id"])
    rows = []
    for item in data["this_week"] + data["this_month"]:
        rows.append({
            "Account": item["account_name"],
            "Score": item["score"],
            "Risk Level": item["risk_level"],
            "Action": item["title"],
            "Type": item["type"],
            "Urgency": item["urgency"],
        })
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["Account", "Score", "Risk Level", "Action", "Type", "Urgency"])
    writer.writeheader()
    writer.writerows(rows)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=playbook.csv"},
    )
