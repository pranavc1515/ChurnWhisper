"""Health score recalculation API."""

import asyncio
import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from api.auth import get_current_user
from services.pipeline_service import run_recalculation, recalc_jobs

router = APIRouter(prefix="/api/scores", tags=["scores"])


@router.post("/recalculate", response_model=dict)
async def trigger_recalculate(user: dict = Depends(get_current_user)):
    """Trigger full recalculation for all accounts."""
    job_id = await run_recalculation(user["_id"])
    return {"success": True, "data": {"job_id": job_id}}


@router.get("/status/{job_id}", response_model=dict)
async def get_status(job_id: str, user: dict = Depends(get_current_user)):
    """Poll recalculation job status."""
    job = recalc_jobs.get(job_id)
    if not job:
        return {"success": False, "error": "Job not found"}
    return {"success": True, "data": job}


@router.get("/stream/{job_id}")
async def stream_progress(job_id: str, user: dict = Depends(get_current_user)):
    """SSE stream for recalculation progress."""

    async def event_generator():
        while True:
            job = recalc_jobs.get(job_id)
            if not job:
                yield f"event: error\ndata: {json.dumps({'message': 'Job not found'})}\n\n"
                break
            yield f"event: progress\ndata: {json.dumps(job)}\n\n"
            if job.get("status") in ("completed", "failed"):
                break
            await asyncio.sleep(1)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
