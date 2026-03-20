"""Gemini AI service for sentiment analysis and health scoring."""

import asyncio
import json
import logging
from typing import Any

import google.generativeai as genai

from config import settings
from prompts.ticket_sentiment import TICKET_SENTIMENT_PROMPT
from prompts.nps_sentiment import NPS_SENTIMENT_PROMPT
from prompts.health_score import HEALTH_SCORE_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self) -> None:
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(
                model_name=settings.gemini_model,
                generation_config={
                    "temperature": settings.gemini_temperature,
                    "top_p": 0.8,
                    "max_output_tokens": settings.gemini_max_output_tokens,
                    "response_mime_type": "application/json",
                },
            )
        else:
            self.model = None

    async def call_gemini(self, prompt: str, max_retries: int = 3) -> dict:
        """Call Gemini API and parse JSON response."""
        if not self.model:
            raise ValueError("Gemini API key not configured")
        for attempt in range(max_retries):
            try:
                response = await asyncio.to_thread(
                    self.model.generate_content, prompt
                )
                text = (response.text or "").strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                return json.loads(text.strip())
            except json.JSONDecodeError as e:
                logger.warning("JSON parse error (attempt %d): %s", attempt + 1, e)
                if attempt == max_retries - 1:
                    raise ValueError(
                        f"AI returned invalid JSON after {max_retries} attempts"
                    )
            except Exception as e:
                err = str(e).lower()
                if "429" in err or "rate" in err or "quota" in err:
                    wait = 2 ** (attempt + 1)
                    logger.warning("Rate limited, waiting %ds...", wait)
                    await asyncio.sleep(wait)
                else:
                    logger.error("Gemini error (attempt %d): %s", attempt + 1, e)
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(1)
        raise Exception("AI service unavailable after retries")

    async def analyze_ticket_sentiment(
        self, subject: str, description: str
    ) -> dict[str, Any]:
        """Analyze ticket. Returns dict with ai_sentiment, ai_category, etc."""
        """Analyze a single support ticket for sentiment and churn signals."""
        prompt = TICKET_SENTIMENT_PROMPT.format(
            subject=subject or "(No subject)",
            description=description or "No description provided",
        )
        result = await self.call_gemini(prompt)
        return {
            "ai_sentiment": result.get("sentiment", "neutral"),
            "ai_category": result.get("category", "general_inquiry"),
            "ai_urgency": result.get("urgency", "low"),
            "ai_summary": result.get("summary", ""),
            "ai_churn_signals": result.get("churn_signals", []),
        }

    async def calculate_health_score(self, account_data: dict) -> dict:
        """Calculate full health score for an account."""
        prompt = HEALTH_SCORE_SYSTEM_PROMPT + "\n\n" + _format_account_data(
            account_data
        )
        return await self.call_gemini(prompt)

    async def analyze_nps_feedback(
        self, feedback: str, score: int
    ) -> dict[str, Any]:
        """Analyze NPS feedback text."""
        prompt = NPS_SENTIMENT_PROMPT.format(
            feedback=feedback or "(No feedback)",
            score=score,
        )
        result = await self.call_gemini(prompt)
        return {
            "ai_sentiment": result.get("sentiment"),
            "ai_key_themes": result.get("key_themes", []),
            "ai_churn_signals": result.get("churn_signals", []),
        }


def _format_account_data(data: dict) -> str:
    """Format account data for Gemini prompt."""
    lines = [
        f"Account: {data.get('account_name', 'Unknown')}",
        f"Company Size: {data.get('company_size', 'N/A')}",
        f"Plan: {data.get('plan_tier', 'N/A')}",
        f"Monthly Revenue: {data.get('monthly_revenue', 'N/A')}",
        f"Contract Renewal: {data.get('contract_renewal_date', 'N/A')}",
        "",
        "=== SIGNAL 1: SUPPORT TICKETS ===",
        data.get("ticket_section", "No tickets"),
        "",
        "=== SIGNAL 2: NPS SURVEY ===",
        data.get("nps_section", "No NPS data"),
        "",
        "=== SIGNAL 3: USAGE / ACTIVITY ===",
        data.get("usage_section", "No usage data"),
        "",
        "=== SIGNAL 4: SUPPORT VELOCITY ===",
        data.get("velocity_section", "Unknown"),
        "",
        "Analyze this account holistically and provide the health assessment.",
    ]
    return "\n".join(lines)


_ai_service: AIService | None = None


def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
