"""Alert creation service."""

from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase


async def create_alert(
    db: AsyncIOMotorDatabase,
    user_id,
    account_id,
    alert_type: str,
    title: str,
    severity: str,
    message: str = "",
) -> None:
    """Create an alert for the user."""
    await db.alerts.insert_one(
        {
            "user_id": user_id,
            "account_id": account_id,
            "type": alert_type,
            "title": title,
            "message": message or title,
            "severity": severity,
            "read": False,
            "created_at": datetime.utcnow(),
        }
    )
