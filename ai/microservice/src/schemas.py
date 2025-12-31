"""
API Request and Response Schemas

Pydantic models for request validation and response serialization.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


class PredictRequest(BaseModel):
    """Request schema for single text prediction."""

    text: str = Field(
        ...,
        description="Customer support ticket text to classify",
        min_length=1,
        max_length=10000,
        examples=["Internet mati total dari pagi! Rugi saya!"]
    )

    ticket_id: Optional[str] = Field(
        None,
        description="Optional ticket ID for tracking",
        examples=["TKT-12345"]
    )

    @field_validator('text')
    @classmethod
    def text_not_empty(cls, v: str) -> str:
        """Validate text is not just whitespace."""
        if not v.strip():
            raise ValueError("Text cannot be empty or whitespace only")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Sinyal internet mati total dari pagi woy rugi saya!",
                "ticket_id": "TKT-12345"
            }
        }


class BatchPredictRequest(BaseModel):
    """Request schema for batch predictions."""

    texts: List[str] = Field(
        ...,
        description="List of customer support ticket texts",
        min_length=1,
        max_length=100
    )

    ticket_ids: Optional[List[str]] = Field(
        None,
        description="Optional list of ticket IDs (must match texts length)"
    )

    @field_validator('texts')
    @classmethod
    def validate_texts(cls, v: List[str]) -> List[str]:
        """Validate all texts are non-empty."""
        if not v:
            raise ValueError("Texts list cannot be empty")

        for i, text in enumerate(v):
            if not text.strip():
                raise ValueError(f"Text at index {i} is empty")

        return v

    @field_validator('ticket_ids')
    @classmethod
    def validate_ticket_ids(cls, v: Optional[List[str]], info) -> Optional[List[str]]:
        """Validate ticket_ids length matches texts if provided."""
        if v is not None and 'texts' in info.data:
            if len(v) != len(info.data['texts']):
                raise ValueError(
                    f"ticket_ids length ({len(v)}) must match texts length ({len(info.data['texts'])})"
                )
        return v


class PredictionOutput(BaseModel):
    """ML model prediction output."""

    cluster: int = Field(
        ...,
        description="Predicted cluster ID (0-3)",
        ge=0,
        le=3
    )

    urgency: str = Field(
        ...,
        description="Urgency level based on cluster",
        examples=["Low", "Medium", "High"]
    )

    priority: str = Field(
        ...,
        description="Priority level for ticket handling",
        examples=["P1", "P2", "P3"]
    )

    confidence: float = Field(
        ...,
        description="Model confidence score (0-1)",
        ge=0.0,
        le=1.0
    )

    auto_escalate: bool = Field(
        ...,
        description="Whether ticket should be auto-escalated"
    )

    probabilities: Optional[List[float]] = Field(
        None,
        description="Probability distribution across all clusters"
    )


class PredictResponse(BaseModel):
    """Response schema for single prediction."""

    ticket_id: Optional[str] = Field(
        None,
        description="Ticket ID if provided in request"
    )

    input_text: str = Field(
        ...,
        description="Original input text"
    )

    cleaned_text: str = Field(
        ...,
        description="Preprocessed text used for prediction"
    )

    prediction: PredictionOutput = Field(
        ...,
        description="ML model prediction results"
    )

    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="Prediction timestamp"
    )

    model_version: str = Field(
        ...,
        description="Model version used for prediction"
    )

    processing_time_ms: Optional[float] = Field(
        None,
        description="Processing time in milliseconds"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "ticket_id": "TKT-12345",
                "input_text": "Sinyal internet mati total dari pagi woy rugi saya!",
                "cleaned_text": "sinyal internet mati total dari pagi woy rugi saya",
                "prediction": {
                    "cluster": 3,
                    "urgency": "High",
                    "priority": "P1",
                    "confidence": 0.9983,
                    "auto_escalate": True,
                    "probabilities": [0.0003, 0.0005, 0.0009, 0.9983]
                },
                "timestamp": "2025-12-31T10:30:00",
                "model_version": "v1.0",
                "processing_time_ms": 15.3
            }
        }


class BatchPredictResponse(BaseModel):
    """Response schema for batch predictions."""

    predictions: List[PredictResponse] = Field(
        ...,
        description="List of prediction results"
    )

    total_processed: int = Field(
        ...,
        description="Total number of texts processed"
    )

    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="Batch processing timestamp"
    )

    total_processing_time_ms: Optional[float] = Field(
        None,
        description="Total batch processing time in milliseconds"
    )


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(
        ...,
        description="Service status",
        examples=["healthy", "unhealthy"]
    )

    model_loaded: bool = Field(
        ...,
        description="Whether ML model is loaded"
    )

    model_version: str = Field(
        ...,
        description="Current model version"
    )

    config_valid: bool = Field(
        ...,
        description="Whether configuration is valid"
    )

    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="Health check timestamp"
    )

    details: Optional[dict] = Field(
        None,
        description="Additional health check details"
    )


class ErrorResponse(BaseModel):
    """Error response schema."""

    error: str = Field(
        ...,
        description="Error type"
    )

    message: str = Field(
        ...,
        description="Human-readable error message"
    )

    details: Optional[dict] = Field(
        None,
        description="Additional error details"
    )

    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="Error timestamp"
    )


__all__ = [
    'PredictRequest',
    'BatchPredictRequest',
    'PredictionOutput',
    'PredictResponse',
    'BatchPredictResponse',
    'HealthResponse',
    'ErrorResponse',
]
