"""ChurnWhisper FastAPI application."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db import close_db, init_db
from db.indexes import create_indexes
from db.mongodb import get_database
from api.health import router as health_router
from api.auth import router as auth_router
from api.upload import router as upload_router
from api.scores import router as scores_router
from api.accounts import router as accounts_router
from api.dashboard import router as dashboard_router
from api.playbook import router as playbook_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    # Startup
    await init_db()
    db = get_database()
    await create_indexes(db)
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="ChurnWhisper",
    description="Customer Success analytics platform for churn prediction",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(scores_router)
app.include_router(accounts_router)
app.include_router(dashboard_router)
app.include_router(playbook_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "ChurnWhisper API", "docs": "/docs"}
