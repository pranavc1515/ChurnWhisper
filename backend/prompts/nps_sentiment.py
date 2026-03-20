"""Prompt for NPS feedback sentiment."""

NPS_SENTIMENT_PROMPT = """Analyze this NPS survey feedback and return ONLY valid JSON:

Feedback: {feedback}
NPS Score: {score}/10

Return:
{{
  "sentiment": "positive | neutral | frustrated | angry | exit_intent",
  "key_themes": ["topic1", "topic2"],
  "churn_signals": ["specific phrases indicating churn risk, or empty array []"]
}}
"""
