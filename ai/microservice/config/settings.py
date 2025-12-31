"""
Application Settings and Configuration

This module centralizes all application settings, paths, and configuration
parameters. Uses environment variables for deployment flexibility.
"""

import os
from pathlib import Path
from typing import Literal


# === Path Configuration ===

# Root directory of the microservice
BASE_DIR = Path(__file__).resolve().parent.parent

# Model directory
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "model-telco-cs.pkl"

# Config directory
CONFIG_DIR = BASE_DIR / "config"
CLUSTER_MAPPING_PATH = CONFIG_DIR / "cluster_mapping.json"
RESPONSE_TEMPLATES_PATH = CONFIG_DIR / "response_templates.json"


# === Model Configuration ===

MODEL_VERSION = "v1.0"
MODEL_NAME = "telco-cs-classifier"
MODEL_TYPE = "LogisticRegression + TfidfVectorizer"

# Model performance metrics (from training)
MODEL_METRICS = {
    "cluster_0_f1": 0.9783,
    "cluster_1_f1": 0.9647,
    "cluster_2_f1": 0.9682,
    "cluster_3_f1": 0.9938,
    "overall_accuracy": 0.97,
}


# === API Configuration ===

# Server settings
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
API_RELOAD = os.getenv("API_RELOAD", "true").lower() == "true"

# CORS settings
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

# API versioning
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"


# === Inference Configuration ===

# Confidence threshold for predictions
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))

# Maximum text length for processing
MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "10000"))

# Batch prediction settings
MAX_BATCH_SIZE = int(os.getenv("MAX_BATCH_SIZE", "100"))


# === Logging Configuration ===

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


# === Feature Flags ===

# Enable detailed prediction metadata
ENABLE_METADATA = os.getenv("ENABLE_METADATA", "true").lower() == "true"

# Enable response time tracking
ENABLE_TIMING = os.getenv("ENABLE_TIMING", "true").lower() == "true"


# === Validation ===

def validate_settings() -> tuple[bool, list[str]]:
    """
    Validate that all required settings are properly configured.

    Returns:
        Tuple of (is_valid: bool, error_messages: list[str])
    """
    errors = []

    # Check model file exists
    if not MODEL_PATH.exists():
        errors.append(f"Model file not found: {MODEL_PATH}")

    # Check config files exist
    if not CLUSTER_MAPPING_PATH.exists():
        errors.append(f"Cluster mapping not found: {CLUSTER_MAPPING_PATH}")

    if not RESPONSE_TEMPLATES_PATH.exists():
        errors.append(f"Response templates not found: {RESPONSE_TEMPLATES_PATH}")

    # Validate numeric ranges
    if CONFIDENCE_THRESHOLD < 0 or CONFIDENCE_THRESHOLD > 1:
        errors.append(f"Invalid confidence threshold: {CONFIDENCE_THRESHOLD} (must be 0-1)")

    if MAX_TEXT_LENGTH <= 0:
        errors.append(f"Invalid max text length: {MAX_TEXT_LENGTH} (must be > 0)")

    if MAX_BATCH_SIZE <= 0:
        errors.append(f"Invalid max batch size: {MAX_BATCH_SIZE} (must be > 0)")

    return len(errors) == 0, errors


# === Runtime Settings Display ===

def display_settings() -> dict:
    """
    Get current settings as a dictionary for display/debugging.

    Returns:
        Dictionary of current configuration values
    """
    return {
        "model": {
            "version": MODEL_VERSION,
            "name": MODEL_NAME,
            "type": MODEL_TYPE,
            "path": str(MODEL_PATH),
            "exists": MODEL_PATH.exists(),
        },
        "api": {
            "host": API_HOST,
            "port": API_PORT,
            "reload": API_RELOAD,
            "version": API_VERSION,
            "prefix": API_PREFIX,
        },
        "inference": {
            "confidence_threshold": CONFIDENCE_THRESHOLD,
            "max_text_length": MAX_TEXT_LENGTH,
            "max_batch_size": MAX_BATCH_SIZE,
        },
        "logging": {
            "level": LOG_LEVEL,
        },
        "features": {
            "metadata": ENABLE_METADATA,
            "timing": ENABLE_TIMING,
        },
    }


__all__ = [
    "MODEL_PATH",
    "CLUSTER_MAPPING_PATH",
    "RESPONSE_TEMPLATES_PATH",
    "MODEL_VERSION",
    "API_HOST",
    "API_PORT",
    "CONFIDENCE_THRESHOLD",
    "validate_settings",
    "display_settings",
]
