"""Prompt for ticket sentiment analysis."""

TICKET_SENTIMENT_PROMPT = """Analyze this customer support ticket and return ONLY valid JSON with no markdown:

Subject: {subject}
Description: {description}

Return this exact structure:
{{
  "sentiment": "positive | neutral | frustrated | angry | exit_intent",
  "category": "bug_report | feature_request | billing | performance | data_export | general_inquiry | cancellation_intent",
  "urgency": "low | medium | high | critical",
  "summary": "One sentence summary of the ticket",
  "churn_signals": ["list of specific phrases or indicators that suggest churn risk, or empty array []"]
}}
"""
