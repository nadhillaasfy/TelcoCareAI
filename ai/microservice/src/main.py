"""
ML Microservice - Main Application

FastAPI application for customer support ticket classification.
"""

import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

# Add parent directory to path for config imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import settings, config_manager
from src.model_loader import initialize_model, get_model_loader
from src.routes import router
from src.schemas import ErrorResponse

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    logger.info("=" * 60)
    logger.info("Starting ML Microservice")
    logger.info("=" * 60)

    # Validate configuration
    logger.info("Validating configuration...")
    config_valid, errors = config_manager.validate_configuration()
    if not config_valid:
        logger.error("Configuration validation failed:")
        for error in errors:
            logger.error(f"  - {error}")
        raise RuntimeError("Invalid configuration. Cannot start service.")

    logger.info("✅ Configuration valid")

    # Load ML model
    logger.info(f"Loading ML model from: {settings.MODEL_PATH}")
    try:
        model_loader = initialize_model()
        model_info = model_loader.get_model_info()
        logger.info(f"✅ Model loaded successfully: {model_info.get('model_type')}")
        logger.info(f"   Version: {settings.MODEL_VERSION}")
        logger.info(f"   Metrics: {settings.MODEL_METRICS}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise RuntimeError(f"Model loading failed: {e}")

    # Display settings
    logger.info("\nService Configuration:")
    logger.info(f"  Host: {settings.API_HOST}")
    logger.info(f"  Port: {settings.API_PORT}")
    logger.info(f"  API Prefix: {settings.API_PREFIX}")
    logger.info(f"  CORS Origins: {settings.CORS_ORIGINS}")

    logger.info("\n" + "=" * 60)
    logger.info("✅ ML Microservice Started Successfully")
    logger.info("=" * 60)

    yield

    # Shutdown
    logger.info("\n" + "=" * 60)
    logger.info("Shutting down ML Microservice")
    logger.info("=" * 60)


# Create FastAPI application
app = FastAPI(
    title="TelcoCare AI - ML Microservice",
    description="""
    Machine Learning microservice for customer support ticket classification.

    ## Features
    - **Single Prediction**: Classify one ticket at a time
    - **Batch Prediction**: Process multiple tickets efficiently
    - **Health Monitoring**: Check service and model status

    ## Classification
    - **4 Clusters**: Low (2x), Medium, High urgency
    - **Auto-Escalation**: High-priority tickets flagged automatically
    - **Confidence Scores**: Prediction confidence (0-1)

    ## Model Performance
    - Precision: 96-99% across all clusters
    - F1-Score: 96-99% across all clusters
    """,
    version=settings.MODEL_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.warning(f"Validation error: {exc.errors()}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="Validation Error",
            message="Invalid request data",
            details={"errors": exc.errors()}
        ).model_dump(mode='json')
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.error(f"Unexpected error: {exc}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal Server Error",
            message="An unexpected error occurred",
            details={"type": type(exc).__name__}
        ).model_dump(mode='json')
    )


# Include routes
app.include_router(router)


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint with service information."""
    return {
        "service": "TelcoCare AI - ML Microservice",
        "version": settings.MODEL_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
        "endpoints": {
            "predict": f"{settings.API_PREFIX}/predict",
            "batch_predict": f"{settings.API_PREFIX}/predict/batch"
        }
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )
