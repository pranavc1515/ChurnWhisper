"""MongoDB index creation on startup."""

import logging

from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create all required indexes for ChurnWhisper collections."""
    try:
        # Users
        await db.users.create_index("email", unique=True)

        # Accounts
        await db.accounts.create_index([("user_id", 1), ("status", 1)])
        await db.accounts.create_index(
            [("user_id", 1), ("account_name_normalized", 1)], unique=True
        )
        await db.accounts.create_index([("user_id", 1), ("account_name", 1)])
        await db.accounts.create_index(
            [("user_id", 1), ("current_health_score", 1)]
        )
        await db.accounts.create_index(
            [("user_id", 1), ("current_risk_level", 1)]
        )
        await db.accounts.create_index(
            [("user_id", 1), ("contract_renewal_date", 1)]
        )

        # Tickets
        await db.tickets.create_index([("user_id", 1), ("account_id", 1)])
        await db.tickets.create_index([("account_id", 1), ("created_date", -1])
        await db.tickets.create_index("upload_batch_id")
        await db.tickets.create_index("ai_sentiment")

        # NPS
        await db.nps_responses.create_index(
            [("user_id", 1), ("account_id", 1)]
        )
        await db.nps_responses.create_index([("account_id", 1), ("date", -1)])
        await db.nps_responses.create_index("upload_batch_id")

        # Usage
        await db.usage_events.create_index(
            [("user_id", 1), ("account_id", 1)]
        )
        await db.usage_events.create_index([("account_id", 1), ("date", -1)])
        await db.usage_events.create_index("upload_batch_id")

        # Health Scores
        await db.health_scores.create_index(
            [("account_id", 1), ("calculated_at", -1)]
        )
        await db.health_scores.create_index(
            [("user_id", 1), ("calculated_at", -1)]
        )
        await db.health_scores.create_index([("user_id", 1), ("risk_level", 1)])

        # Alerts
        await db.alerts.create_index(
            [("user_id", 1), ("read", 1), ("created_at", -1)]
        )
        await db.alerts.create_index([("user_id", 1), ("created_at", -1)])

        # Uploads
        await db.uploads.create_index([("user_id", 1), ("uploaded_at", -1)])

        # Settings
        await db.settings.create_index("user_id", unique=True)

        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning("Index creation completed with warnings: %s", e)
