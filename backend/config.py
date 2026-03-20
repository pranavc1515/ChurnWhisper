"""Pydantic settings for ChurnWhisper backend."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "churnwhisper"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Gemini AI
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    gemini_max_output_tokens: int = 4096
    gemini_temperature: float = 0.3

    # JWT Auth
    jwt_secret_key: str = "your-very-long-random-secret-key-min-32-chars-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours
    jwt_refresh_token_expire_days: int = 7

    # App Configuration
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173"
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 25
    max_accounts_per_user: int = 500
    max_concurrent_ai_calls: int = 5
    recalc_timeout_seconds: int = 600

    # Scoring Thresholds
    score_critical_max: int = 30
    score_attention_max: int = 60

    # Optional: Email
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    alert_from_email: str = "alerts@churnwhisper.com"


settings = Settings()
