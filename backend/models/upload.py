"""Upload models."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UploadPreviewResponse(BaseModel):
    columns: list[str]
    suggested_mapping: dict[str, str]


class ColumnMappingRequest(BaseModel):
    mapping: dict[str, str]  # system_field -> csv_column
