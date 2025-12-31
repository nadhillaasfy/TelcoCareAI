"""
API Routes for ML Inference Service

Endpoints for ticket classification and prediction.
"""

import time
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

# Add parent directory to path for config imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import (
    settings,
    preprocessing,
    get_cluster_config,
    config_manager,
)
from src.schemas import (
    PredictRequest,
    BatchPredictRequest,
    PredictResponse,
    BatchPredictResponse,
    PredictionOutput,
    HealthResponse,
    ErrorResponse,
)
from src.model_loader import get_model_loader

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix=settings.API_PREFIX, tags=["predictions"])


@router.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Classify single ticket",
    description="Classify a customer support ticket and return urgency/priority"
)
async def predict_ticket(request: PredictRequest) -> PredictResponse:
    """
    Predict cluster, urgency, and priority for a single support ticket.

    This endpoint:
    1. Preprocesses the input text
    2. Runs ML model prediction
    3. Maps cluster to urgency/priority
    4. Returns comprehensive results

    Args:
        request: PredictRequest with text and optional ticket_id

    Returns:
        PredictResponse with prediction results

    Raises:
        HTTPException 400: If text validation fails
        HTTPException 500: If prediction fails
    """
    start_time = time.time()

    try:
        # Validate input text
        is_valid, error_msg = preprocessing.validate_text_input(request.text)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invalid input", "message": error_msg}
            )

        # Preprocess text
        cleaned_text = preprocessing.clean_text(request.text)

        # Get model
        model_loader = get_model_loader()
        if not model_loader.is_loaded():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "Model not loaded", "message": "ML model is not initialized"}
            )

        # Make prediction
        cluster, confidence, probabilities = model_loader.predict(cleaned_text)

        # Get cluster configuration
        cluster_config = get_cluster_config(cluster)

        # Build prediction output
        prediction = PredictionOutput(
            cluster=cluster,
            urgency=cluster_config["urgency"],
            priority=cluster_config["priority"],
            confidence=round(confidence, 4),
            auto_escalate=cluster_config.get("auto_escalate", False),
            probabilities=[round(float(p), 4) for p in probabilities]
        )

        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000  # Convert to ms

        # Build response
        response = PredictResponse(
            ticket_id=request.ticket_id,
            input_text=request.text,
            cleaned_text=cleaned_text,
            prediction=prediction,
            model_version=settings.MODEL_VERSION,
            processing_time_ms=round(processing_time, 2)
        )

        logger.info(
            f"Prediction completed: ticket_id={request.ticket_id}, "
            f"cluster={cluster}, confidence={confidence:.4f}, "
            f"time={processing_time:.2f}ms"
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Prediction failed",
                "message": str(e)
            }
        )


@router.post(
    "/predict/batch",
    response_model=BatchPredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Classify multiple tickets",
    description="Classify multiple customer support tickets in a single request"
)
async def predict_batch(request: BatchPredictRequest) -> BatchPredictResponse:
    """
    Predict for multiple support tickets in batch.

    More efficient than calling /predict multiple times.

    Args:
        request: BatchPredictRequest with list of texts

    Returns:
        BatchPredictResponse with list of predictions

    Raises:
        HTTPException 400: If batch validation fails
        HTTPException 500: If batch prediction fails
    """
    start_time = time.time()

    try:
        # Validate batch size
        if len(request.texts) > settings.MAX_BATCH_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Batch too large",
                    "message": f"Maximum batch size is {settings.MAX_BATCH_SIZE}, got {len(request.texts)}"
                }
            )

        # Preprocess all texts
        cleaned_texts = []
        for text in request.texts:
            is_valid, error_msg = preprocessing.validate_text_input(text)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"error": "Invalid input", "message": error_msg}
                )
            cleaned_texts.append(preprocessing.clean_text(text))

        # Get model
        model_loader = get_model_loader()
        if not model_loader.is_loaded():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "Model not loaded", "message": "ML model is not initialized"}
            )

        # Batch prediction
        batch_results = model_loader.predict_batch(cleaned_texts)

        # Build responses
        predictions: List[PredictResponse] = []
        for i, (cluster, confidence, probabilities) in enumerate(batch_results):
            cluster_config = get_cluster_config(cluster)

            prediction = PredictionOutput(
                cluster=cluster,
                urgency=cluster_config["urgency"],
                priority=cluster_config["priority"],
                confidence=round(confidence, 4),
                auto_escalate=cluster_config.get("auto_escalate", False),
                probabilities=[round(float(p), 4) for p in probabilities]
            )

            ticket_id = request.ticket_ids[i] if request.ticket_ids else None

            predictions.append(
                PredictResponse(
                    ticket_id=ticket_id,
                    input_text=request.texts[i],
                    cleaned_text=cleaned_texts[i],
                    prediction=prediction,
                    model_version=settings.MODEL_VERSION
                )
            )

        # Calculate total processing time
        total_processing_time = (time.time() - start_time) * 1000

        response = BatchPredictResponse(
            predictions=predictions,
            total_processed=len(predictions),
            total_processing_time_ms=round(total_processing_time, 2)
        )

        logger.info(
            f"Batch prediction completed: {len(predictions)} tickets, "
            f"time={total_processing_time:.2f}ms"
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Batch prediction failed",
                "message": str(e)
            }
        )


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Check service health and model status"
)
async def health_check() -> HealthResponse:
    """
    Service health check endpoint.

    Returns:
        HealthResponse with service status

    This endpoint checks:
    - Model loading status
    - Configuration validity
    - Overall service health
    """
    try:
        model_loader = get_model_loader()
        model_loaded = model_loader.is_loaded()

        # Validate configuration
        config_valid, errors = config_manager.validate_configuration()

        # Determine overall status
        is_healthy = model_loaded and config_valid

        status_str = "healthy" if is_healthy else "unhealthy"

        details = {
            "model_info": model_loader.get_model_info(),
            "config_errors": errors if not config_valid else []
        }

        return HealthResponse(
            status=status_str,
            model_loaded=model_loaded,
            model_version=settings.MODEL_VERSION,
            config_valid=config_valid,
            details=details if not is_healthy else None
        )

    except Exception as e:
        logger.error(f"Health check error: {e}", exc_info=True)
        return HealthResponse(
            status="unhealthy",
            model_loaded=False,
            model_version=settings.MODEL_VERSION,
            config_valid=False,
            details={"error": str(e)}
        )


__all__ = ['router']
