#!/usr/bin/env python3
"""Seed demo data for ChurnWhisper."""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId


async def seed():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "churnwhisper")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]

    # Create demo user
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12)
    user_doc = {
        "name": "Demo User",
        "email": "demo@churnwhisper.com",
        "password_hash": pwd.hash("Demo123!"),
        "company_name": "ChurnWhisper",
        "role": "CS Manager",
        "avatar_url": None,
        "refresh_token": None,
        "reset_token": None,
        "reset_token_expires": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
    }
    existing = await db.users.find_one({"email": user_doc["email"]})
    if existing:
        user_id = existing["_id"]
        print("Using existing demo user")
    else:
        r = await db.users.insert_one(user_doc)
        user_id = r.inserted_id
        print("Created demo user: demo@churnwhisper.com / Demo123!")

    now = datetime.utcnow()
    accounts_data = [
        ("Acme Corp", "51-200", "Technology", "Enterprise", 35000, 12, "critical"),
        ("BrightTech", "11-50", "SaaS", "Professional", 5000, 91, "champion"),
        ("MegaRetail", "200+", "Retail", "Enterprise", 45000, 28, "high"),
        ("StartupBox", "1-10", "Startup", "Starter", 500, 79, "healthy"),
        ("DataDrive", "51-200", "Data", "Professional", 12000, 58, "elevated"),
    ]
    account_ids = {}
    for name, size, industry, plan, revenue, score, risk in accounts_data:
        acc = await db.accounts.find_one(
            {"user_id": user_id, "account_name_normalized": name.lower()}
        )
        if acc:
            account_ids[name] = acc["_id"]
        else:
            doc = {
                "user_id": user_id,
                "account_name": name,
                "account_name_normalized": name.lower(),
                "company_size": size,
                "industry": industry,
                "plan_tier": plan,
                "monthly_revenue": revenue,
                "contract_renewal_date": now + timedelta(days=30),
                "primary_contact": {"name": None, "email": None, "phone": None},
                "tags": [],
                "status": "active",
                "current_health_score": score,
                "current_risk_level": risk,
                "last_score_calculated_at": now,
                "created_at": now,
                "updated_at": now,
            }
            r = await db.accounts.insert_one(doc)
            account_ids[name] = r.inserted_id

    # Insert pre-computed health scores
    for name, _, _, _, _, score, risk in accounts_data:
        acc_id = account_ids[name]
        hs = {
            "user_id": user_id,
            "account_id": acc_id,
            "account_name": name,
            "score": score,
            "risk_level": risk,
            "confidence": "high",
            "score_breakdown": {},
            "risk_factors": [{"id": "rf1", "title": "Demo risk", "description": "Seeded for demo.", "severity": "medium", "category": "support", "evidence": [], "trend": "stable"}],
            "positive_signals": [],
            "recommended_actions": [
                {"id": "ra1", "title": "Schedule call", "description": "Reach out to discuss.", "type": "check_in_call", "urgency": "this_week", "expected_impact": "Build relationship", "talk_track": "Hi, checking in.", "status": "pending", "completed_at": None, "notes": None},
            ],
            "churn_prediction": {"probability_30_days": 20, "probability_90_days": 35, "estimated_churn_date": None, "primary_churn_trigger": "Demo"},
            "account_summary": f"Demo account {name} with score {score}.",
            "raw_signals_snapshot": {},
            "previous_score": None,
            "score_change": None,
            "calculated_at": now,
        }
        await db.health_scores.insert_one(hs)

    # Alerts
    await db.alerts.insert_one({
        "user_id": user_id,
        "account_id": account_ids["Acme Corp"],
        "type": "new_critical",
        "title": "NEW CRITICAL: Acme Corp score dropped to 12",
        "message": "Account requires immediate attention.",
        "severity": "critical",
        "read": False,
        "created_at": now,
    })

    print("Demo data seeded. Login: demo@churnwhisper.com / Demo123!")


if __name__ == "__main__":
    asyncio.run(seed())
