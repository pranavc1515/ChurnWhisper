"""CSV parsing for tickets, NPS, and usage data."""

import io
from datetime import datetime
from typing import Any

import pandas as pd
from dateutil import parser as date_parser

from utils.column_mapper import (
    auto_map_columns,
    TICKET_REQUIRED,
    NPS_REQUIRED,
    USAGE_REQUIRED,
)

DATE_FORMATS = [
    "%Y-%m-%d",
    "%Y-%m-%d %H:%M:%S",
    "%m/%d/%Y",
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%m-%d-%Y",
]


def _parse_date(val: Any) -> datetime | None:
    """Parse date from various formats."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    if isinstance(val, datetime):
        return val
    s = str(val).strip()
    if not s:
        return None
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    try:
        return date_parser.parse(s)
    except Exception:
        return None


def parse_tickets_csv(
    content: bytes | str,
    column_mapping: dict[str, str],
) -> tuple[list[dict], list[str]]:
    """
    Parse tickets CSV. Returns (rows, warnings).
    column_mapping: system_field -> csv_column
    """
    df = pd.read_csv(io.BytesIO(content) if isinstance(content, bytes) else io.StringIO(content))
    df = df.fillna("")
    warnings: list[str] = []
    rows: list[dict] = []

    rev_map = {v: k for k, v in column_mapping.items()}
    for idx, row in df.iterrows():
        try:
            r: dict[str, Any] = {}
            for sys_field, csv_col in column_mapping.items():
                if csv_col not in df.columns:
                    continue
                val = row.get(csv_col, "")
                if pd.isna(val):
                    val = ""
                if sys_field in ("created_date", "resolution_date"):
                    r[sys_field] = _parse_date(val)
                elif sys_field == "satisfaction_score":
                    try:
                        r[sys_field] = float(val) if val else None
                    except (ValueError, TypeError):
                        r[sys_field] = None
                else:
                    r[sys_field] = str(val).strip() if val else None

            if not r.get("account_name"):
                warnings.append(f"Row {idx + 2}: missing account_name, skipped")
                continue
            if not r.get("ticket_id"):
                warnings.append(f"Row {idx + 2}: missing ticket_id, skipped")
                continue
            if not r.get("subject"):
                r["subject"] = "(No subject)"
            rows.append(r)
        except Exception as e:
            warnings.append(f"Row {idx + 2}: {e}")

    return rows, warnings


def parse_nps_csv(
    content: bytes | str,
    column_mapping: dict[str, str],
) -> tuple[list[dict], list[str]]:
    """Parse NPS CSV. Returns (rows, warnings)."""
    df = pd.read_csv(io.BytesIO(content) if isinstance(content, bytes) else io.StringIO(content))
    df = df.fillna("")
    warnings: list[str] = []
    rows: list[dict] = []

    for idx, row in df.iterrows():
        try:
            r: dict[str, Any] = {}
            for sys_field, csv_col in column_mapping.items():
                if csv_col not in df.columns:
                    continue
                val = row.get(csv_col, "")
                if pd.isna(val):
                    val = ""
                if sys_field == "date":
                    r["date"] = _parse_date(val)
                elif sys_field == "score":
                    try:
                        r["score"] = int(float(val)) if val else None
                    except (ValueError, TypeError):
                        r["score"] = None
                else:
                    r[sys_field] = str(val).strip() if val else None

            if not r.get("account_name"):
                warnings.append(f"Row {idx + 2}: missing account_name, skipped")
                continue
            if r.get("score") is None or r.get("score") < 0 or r.get("score") > 10:
                warnings.append(f"Row {idx + 2}: invalid NPS score, skipped")
                continue
            rows.append(r)
        except Exception as e:
            warnings.append(f"Row {idx + 2}: {e}")

    return rows, warnings


def parse_usage_csv(
    content: bytes | str,
    column_mapping: dict[str, str],
) -> tuple[list[dict], list[str]]:
    """Parse usage CSV. Returns (rows, warnings)."""
    df = pd.read_csv(io.BytesIO(content) if isinstance(content, bytes) else io.StringIO(content))
    df = df.fillna("")
    warnings: list[str] = []
    rows: list[dict] = []

    for idx, row in df.iterrows():
        try:
            r: dict[str, Any] = {}
            for sys_field, csv_col in column_mapping.items():
                if csv_col not in df.columns:
                    continue
                val = row.get(csv_col, "")
                if pd.isna(val):
                    val = ""
                if sys_field in ("count_last_30_days", "count_previous_30_days"):
                    try:
                        r[sys_field] = int(float(val)) if val else 0
                    except (ValueError, TypeError):
                        r[sys_field] = 0
                elif sys_field == "date":
                    r["date"] = _parse_date(val)
                else:
                    r[sys_field] = str(val).strip() if val else None

            if not r.get("account_name"):
                warnings.append(f"Row {idx + 2}: missing account_name, skipped")
                continue
            rows.append(r)
        except Exception as e:
            warnings.append(f"Row {idx + 2}: {e}")

    return rows, warnings


def get_csv_headers(content: bytes | str) -> list[str]:
    """Return CSV column names from first row."""
    df = pd.read_csv(
        io.BytesIO(content) if isinstance(content, bytes) else io.StringIO(content),
        nrows=0,
    )
    return list(df.columns)
