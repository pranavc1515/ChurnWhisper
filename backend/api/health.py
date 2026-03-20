"""Health check endpoint."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/api/health")
async def health_check():
    """Health check for load balancers and monitoring."""
    return {"status": "ok", "service": "churnwhisper"}
