"""Upload API routes."""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from bson import ObjectId

from api.auth import get_current_user
from db.mongodb import get_database
from services.csv_parser import (
    get_csv_headers,
    parse_tickets_csv,
    parse_nps_csv,
    parse_usage_csv,
)
from utils.column_mapper import (
    auto_map_columns,
    TICKET_REQUIRED,
    NPS_REQUIRED,
    USAGE_REQUIRED,
)
from config import settings

router = APIRouter(prefix="/api/upload", tags=["upload"])


def _normalize_account_name(name: str) -> str:
    return name.strip().lower() if name else ""


async def _get_or_create_account(
    db, user_id: ObjectId, account_name: str
) -> ObjectId:
    """Get or create account by name. Returns account_id."""
    normalized = _normalize_account_name(account_name)
    if not normalized:
        raise ValueError("Empty account name")
    acc = await db.accounts.find_one(
        {"user_id": user_id, "account_name_normalized": normalized, "status": "active"}
    )
    if acc:
        return acc["_id"]
    now = datetime.utcnow()
    doc = {
        "user_id": user_id,
        "account_name": account_name.strip(),
        "account_name_normalized": normalized,
        "company_size": None,
        "industry": None,
        "plan_tier": None,
        "monthly_revenue": None,
        "contract_renewal_date": None,
        "primary_contact": {"name": None, "email": None, "phone": None},
        "tags": [],
        "status": "active",
        "current_health_score": None,
        "current_risk_level": None,
        "last_score_calculated_at": None,
        "created_at": now,
        "updated_at": now,
    }
    r = await db.accounts.insert_one(doc)
    return r.inserted_id


@router.post("/preview", response_model=dict)
async def preview_csv(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Preview CSV headers and return suggested column mapping."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file required")
    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 25MB)")
    headers = get_csv_headers(content)
    return {
        "success": True,
        "data": {
            "columns": headers,
            "suggested_mapping": {},
        },
    }


@router.post("/preview/tickets", response_model=dict)
async def preview_tickets(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Preview tickets CSV and return suggested mapping."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file required")
    content = await file.read()
    headers = get_csv_headers(content)
    suggested = auto_map_columns(headers, TICKET_REQUIRED + ["description", "status", "priority", "satisfaction_score", "resolution_date", "assigned_to", "category"])
    return {
        "success": True,
        "data": {"columns": headers, "suggested_mapping": suggested},
    }


@router.post("/preview/nps", response_model=dict)
async def preview_nps(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Preview NPS CSV and return suggested mapping."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file required")
    content = await file.read()
    headers = get_csv_headers(content)
    suggested = auto_map_columns(headers, NPS_REQUIRED + ["feedback", "respondent_name", "respondent_role"])
    return {
        "success": True,
        "data": {"columns": headers, "suggested_mapping": suggested},
    }


@router.post("/preview/usage", response_model=dict)
async def preview_usage(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Preview usage CSV and return suggested mapping."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file required")
    content = await file.read()
    headers = get_csv_headers(content)
    suggested = auto_map_columns(headers, USAGE_REQUIRED + ["active_users", "date"])
    return {
        "success": True,
        "data": {"columns": headers, "suggested_mapping": suggested},
    }


@router.post("/tickets", response_model=dict)
async def upload_tickets(
    file: UploadFile = File(...),
    mapping: str = Form(...),  # JSON string
    user: dict = Depends(get_current_user),
):
    """Upload tickets CSV with column mapping."""
    import json
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file required")
    try:
        col_map = json.loads(mapping)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid mapping JSON")
    for f in TICKET_REQUIRED:
        if f not in col_map or not col_map[f]:
            raise HTTPException(status_code=400, detail=f"Required column '{f}' must be mapped")
    content = await file.read()
    rows, warnings = parse_tickets_csv(content, col_map)
    db = get_database()
    user_id = user["_id"]
    now = datetime.utcnow()
    upload_doc = {
        "user_id": user_id,
        "file_name": file.filename or "tickets.csv",
        "file_type": "tickets",
        "row_count": len(rows),
        "new_accounts_detected": 0,
        "status": "processing",
        "error_message": None,
        "column_mapping": col_map,
        "warnings": warnings,
        "uploaded_at": now,
        "processed_at": None,
    }
    upload_id = (await db.uploads.insert_one(upload_doc)).inserted_id
    new_accounts: set[str] = set()
    tickets_created = 0
    existing_before = await db.accounts.count_documents({"user_id": user_id})
    ai_service = None
    if settings.gemini_api_key:
        from services.ai_service import get_ai_service
        ai_service = get_ai_service()

    async def process_ticket(r: dict) -> tuple[dict, bool]:
        acc_id = await _get_or_create_account(db, user_id, r["account_name"])
        subject = r.get("subject") or "(No subject)"
        description = r.get("description") or ""
        ai_data = {
            "ai_sentiment": "neutral",
            "ai_category": "general_inquiry",
            "ai_urgency": "low",
            "ai_summary": "",
            "ai_churn_signals": [],
        }
        if ai_service:
            try:
                ai_data = await ai_service.analyze_ticket_sentiment(subject, description)
            except Exception:
                pass
        ticket_doc = {
            "user_id": user_id,
            "account_id": acc_id,
            "account_name": r["account_name"],
            "ticket_id": str(r["ticket_id"]),
            "subject": subject,
            "description": r.get("description"),
            "status": r.get("status"),
            "priority": r.get("priority"),
            "satisfaction_score": r.get("satisfaction_score"),
            "created_date": r.get("created_date"),
            "resolution_date": r.get("resolution_date"),
            "assigned_to": r.get("assigned_to"),
            "category_original": r.get("category"),
            **ai_data,
            "upload_batch_id": upload_id,
            "created_at": now,
        }
        return ticket_doc, True

    import asyncio
    sem = asyncio.Semaphore(5)
    async def process_one(r: dict):
        async with sem:
            doc, ok = await process_ticket(r)
            if ok:
                await db.tickets.insert_one(doc)
                return 1
        return 0

    tasks = [process_one(r) for r in rows]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for i, res in enumerate(results):
        if isinstance(res, Exception):
            warnings.append(f"Row {i + 2}: {res}")
        else:
            tickets_created += res
    existing_after = await db.accounts.count_documents({"user_id": user_id})
    new_count = max(0, existing_after - existing_before)
    await db.uploads.update_one(
        {"_id": upload_id},
        {
            "$set": {
                "status": "completed",
                "new_accounts_detected": new_count,
                "processed_at": datetime.utcnow(),
            }
        },
    )
    return {
        "success": True,
        "data": {
            "upload_id": str(upload_id),
            "tickets_imported": tickets_created,
            "new_accounts_detected": new_count,
            "warnings": warnings,
        },
    }


@router.post("/nps", response_model=dict)
async def upload_nps(
    file: UploadFile = File(...),
    mapping: str = Form(...),
    user: dict = Depends(get_current_user),
):
    """Upload NPS CSV."""
    import json
    try:
        col_map = json.loads(mapping)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid mapping JSON")
    for f in NPS_REQUIRED:
        if f not in col_map or not col_map[f]:
            raise HTTPException(status_code=400, detail=f"Required column '{f}' must be mapped")
    content = await file.read()
    rows, warnings = parse_nps_csv(content, col_map)
    db = get_database()
    user_id = user["_id"]
    now = datetime.utcnow()
    upload_doc = {
        "user_id": user_id,
        "file_name": file.filename or "nps.csv",
        "file_type": "nps",
        "row_count": len(rows),
        "new_accounts_detected": 0,
        "status": "processing",
        "column_mapping": col_map,
        "warnings": warnings,
        "uploaded_at": now,
        "processed_at": None,
    }
    upload_id = (await db.uploads.insert_one(upload_doc)).inserted_id
    new_accounts = set()
    ai_service = None
    if settings.gemini_api_key:
        from services.ai_service import get_ai_service
        ai_service = get_ai_service()
    for r in rows:
        acc_id = await _get_or_create_account(db, user_id, r["account_name"])
        new_accounts.add(r["account_name"])
        nps_cat = "promoter" if r["score"] >= 9 else ("passive" if r["score"] >= 7 else "detractor")
        ai_sentiment = None
        ai_themes = []
        ai_churn = []
        if ai_service and r.get("feedback"):
            try:
                ai_result = await ai_service.analyze_nps_feedback(r["feedback"], r["score"])
                ai_sentiment = ai_result.get("ai_sentiment")
                ai_themes = ai_result.get("ai_key_themes", [])
                ai_churn = ai_result.get("ai_churn_signals", [])
            except Exception:
                pass
        nps_doc = {
            "user_id": user_id,
            "account_id": acc_id,
            "account_name": r["account_name"],
            "score": r["score"],
            "nps_category": nps_cat,
            "feedback": r.get("feedback"),
            "respondent_name": r.get("respondent_name"),
            "respondent_role": r.get("respondent_role"),
            "date": r.get("date") or now,
            "ai_sentiment": ai_sentiment,
            "ai_key_themes": ai_themes,
            "ai_churn_signals": ai_churn,
            "upload_batch_id": upload_id,
            "created_at": now,
        }
        await db.nps_responses.insert_one(nps_doc)
    await db.uploads.update_one(
        {"_id": upload_id},
        {
            "$set": {
                "status": "completed",
                "new_accounts_detected": len(new_accounts),
                "processed_at": datetime.utcnow(),
            }
        },
    )
    return {
        "success": True,
        "data": {
            "upload_id": str(upload_id),
            "responses_imported": len(rows),
            "new_accounts_detected": len(new_accounts),
            "warnings": warnings,
        },
    }


@router.post("/usage", response_model=dict)
async def upload_usage(
    file: UploadFile = File(...),
    mapping: str = Form(...),
    user: dict = Depends(get_current_user),
):
    """Upload usage CSV."""
    import json
    try:
        col_map = json.loads(mapping)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid mapping JSON")
    for f in USAGE_REQUIRED:
        if f not in col_map or not col_map[f]:
            raise HTTPException(status_code=400, detail=f"Required column '{f}' must be mapped")
    content = await file.read()
    rows, warnings = parse_usage_csv(content, col_map)
    db = get_database()
    user_id = user["_id"]
    now = datetime.utcnow()
    upload_doc = {
        "user_id": user_id,
        "file_name": file.filename or "usage.csv",
        "file_type": "usage",
        "row_count": len(rows),
        "new_accounts_detected": 0,
        "status": "processing",
        "column_mapping": col_map,
        "warnings": warnings,
        "uploaded_at": now,
        "processed_at": None,
    }
    upload_id = (await db.uploads.insert_one(upload_doc)).inserted_id
    new_accounts = set()
    for r in rows:
        acc_id = await _get_or_create_account(db, user_id, r["account_name"])
        new_accounts.add(r["account_name"])
        curr = r.get("count_last_30_days") or 0
        prev = r.get("count_previous_30_days") or 0
        change_pct = ((curr - prev) / prev * 100) if prev else 0
        trend = "growing" if change_pct > 0 else ("stable" if change_pct == 0 else ("declining" if change_pct > -50 else "collapsing"))
        usage_doc = {
            "user_id": user_id,
            "account_id": acc_id,
            "account_name": r["account_name"],
            "event_type": r.get("event_type") or "unknown",
            "count_current": curr,
            "count_previous": prev,
            "change_pct": change_pct,
            "active_users_current": None,
            "active_users_previous": None,
            "active_users_change_pct": None,
            "engagement_trend": trend,
            "date": r.get("date") or now,
            "upload_batch_id": upload_id,
            "created_at": now,
        }
        await db.usage_events.insert_one(usage_doc)
    await db.uploads.update_one(
        {"_id": upload_id},
        {
            "$set": {
                "status": "completed",
                "new_accounts_detected": len(new_accounts),
                "processed_at": datetime.utcnow(),
            }
        },
    )
    return {
        "success": True,
        "data": {
            "upload_id": str(upload_id),
            "events_imported": len(rows),
            "new_accounts_detected": len(new_accounts),
            "warnings": warnings,
        },
    }


@router.get("/history", response_model=dict)
async def upload_history(
    user: dict = Depends(get_current_user),
):
    """List upload history."""
    db = get_database()
    cursor = db.uploads.find({"user_id": user["_id"]}).sort("uploaded_at", -1).limit(50)
    items = await cursor.to_list(length=50)
    return {
        "success": True,
        "data": [
            {
                "id": str(u["_id"]),
                "file_name": u["file_name"],
                "file_type": u["file_type"],
                "row_count": u["row_count"],
                "new_accounts_detected": u.get("new_accounts_detected", 0),
                "status": u["status"],
                "uploaded_at": u["uploaded_at"].isoformat() if u.get("uploaded_at") else None,
            }
            for u in items
        ],
    }
