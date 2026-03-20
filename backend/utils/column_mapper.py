"""Auto-mapping logic for CSV columns to system fields."""

# Maps system field name -> list of possible CSV column names (case-insensitive)
AUTO_MAP_RULES: dict[str, list[str]] = {
    "account_name": [
        "account",
        "customer",
        "company",
        "client",
        "organization",
        "org",
        "account_name",
        "company_name",
    ],
    "ticket_id": [
        "id",
        "ticket_id",
        "ticket_number",
        "case_id",
        "case_number",
        "issue_id",
    ],
    "subject": ["subject", "title", "summary", "issue", "topic"],
    "description": [
        "description",
        "body",
        "text",
        "detail",
        "content",
        "message",
    ],
    "created_date": [
        "date",
        "created",
        "created_at",
        "opened_date",
        "timestamp",
        "submitted",
    ],
    "satisfaction_score": [
        "csat",
        "satisfaction",
        "rating",
        "score",
        "satisfaction_score",
    ],
    "score": ["nps", "score", "rating", "nps_score"],
    "feedback": [
        "feedback",
        "comment",
        "response",
        "text",
        "verbatim",
        "open_text",
    ],
    "event_type": ["event_type", "event", "activity"],
    "count_last_30_days": [
        "count_last_30_days",
        "count_current",
        "current_count",
        "last_30_days",
    ],
    "count_previous_30_days": [
        "count_previous_30_days",
        "count_previous",
        "previous_count",
        "previous_30_days",
    ],
}


def auto_map_columns(
    csv_columns: list[str], expected_fields: list[str]
) -> dict[str, str]:
    """
    Auto-map CSV columns to system fields.
    Returns dict: system_field -> csv_column_name
    """
    result: dict[str, str] = {}
    csv_lower = {c.strip().lower(): c for c in csv_columns}

    for field in expected_fields:
        rules = AUTO_MAP_RULES.get(field, [field, field.replace("_", " ")])
        for rule in rules:
            rl = rule.lower()
            if rl in csv_lower:
                result[field] = csv_lower[rl]
                break
            # Fuzzy: check if any csv column contains the rule
            for csv_low, csv_orig in csv_lower.items():
                if rl in csv_low or csv_low in rl:
                    result[field] = csv_orig
                    break
            if field in result:
                break

    return result


# Required fields per upload type
TICKET_REQUIRED = ["ticket_id", "account_name", "created_date", "subject"]
TICKET_OPTIONAL = [
    "description",
    "status",
    "priority",
    "satisfaction_score",
    "resolution_date",
    "assigned_to",
    "category",
]

NPS_REQUIRED = ["account_name", "score", "date"]
NPS_OPTIONAL = ["feedback", "respondent_name", "respondent_role"]

USAGE_REQUIRED = [
    "account_name",
    "event_type",
    "count_last_30_days",
    "count_previous_30_days",
]
USAGE_OPTIONAL = ["active_users", "date"]
