"""
ML Model Loader and Wrapper

This module handles loading the trained scikit-learn model and provides
a clean interface for making predictions.
"""

import joblib
import numpy as np
from pathlib import Path
from typing import Optional, Tuple
import logging

# Add parent directory to path for config imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import settings, preprocessing

logger = logging.getLogger(__name__)


class ModelLoader:
    """
    Loads and manages the ML model pipeline.

    The model is a scikit-learn Pipeline containing:
    - TfidfVectorizer (text -> features)
    - LogisticRegression (features -> cluster prediction)
    """

    def __init__(self, model_path: Optional[Path] = None):
        """
        Initialize model loader.

        Args:
            model_path: Path to the .pkl model file.
                       If None, uses settings.MODEL_PATH
        """
        self.model_path = model_path or settings.MODEL_PATH
        self.model = None
        self._is_loaded = False

    def load(self) -> None:
        """
        Load the model from disk.

        Raises:
            FileNotFoundError: If model file doesn't exist
            Exception: If model loading fails
        """
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model file not found: {self.model_path}\n"
                f"Please ensure the model is trained and saved."
            )

        try:
            logger.info(f"Loading model from: {self.model_path}")
            self.model = joblib.load(self.model_path)
            self._is_loaded = True
            logger.info("Model loaded successfully")

            # Validate model has required methods
            if not hasattr(self.model, 'predict'):
                raise ValueError("Loaded object does not have 'predict' method")
            if not hasattr(self.model, 'predict_proba'):
                raise ValueError("Loaded object does not have 'predict_proba' method")

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._is_loaded

    def predict(self, text: str) -> Tuple[int, float, np.ndarray]:
        """
        Make a prediction for input text.

        Args:
            text: Cleaned text input

        Returns:
            Tuple of (predicted_cluster: int, confidence: float, probabilities: np.ndarray)

        Raises:
            RuntimeError: If model is not loaded
            ValueError: If prediction fails
        """
        if not self.is_loaded():
            raise RuntimeError("Model is not loaded. Call load() first.")

        try:
            # Predict cluster
            cluster = self.model.predict([text])[0]

            # Get probability distribution
            probabilities = self.model.predict_proba([text])[0]

            # Confidence is the max probability
            confidence = float(probabilities.max())

            return int(cluster), confidence, probabilities

        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise ValueError(f"Failed to make prediction: {e}")

    def predict_batch(self, texts: list[str]) -> list[Tuple[int, float, np.ndarray]]:
        """
        Make predictions for multiple texts.

        Args:
            texts: List of cleaned text inputs

        Returns:
            List of tuples (cluster, confidence, probabilities)

        Raises:
            RuntimeError: If model is not loaded
        """
        if not self.is_loaded():
            raise RuntimeError("Model is not loaded. Call load() first.")

        try:
            # Batch predict
            clusters = self.model.predict(texts)
            probabilities = self.model.predict_proba(texts)

            results = []
            for cluster, probs in zip(clusters, probabilities):
                confidence = float(probs.max())
                results.append((int(cluster), confidence, probs))

            return results

        except Exception as e:
            logger.error(f"Batch prediction failed: {e}")
            raise ValueError(f"Failed to make batch predictions: {e}")

    def get_model_info(self) -> dict:
        """
        Get information about the loaded model.

        Returns:
            Dictionary with model metadata
        """
        if not self.is_loaded():
            return {
                "loaded": False,
                "model_path": str(self.model_path),
                "exists": self.model_path.exists()
            }

        info = {
            "loaded": True,
            "model_path": str(self.model_path),
            "model_type": type(self.model).__name__,
            "version": settings.MODEL_VERSION,
            "metrics": settings.MODEL_METRICS,
        }

        # Try to get pipeline steps
        try:
            if hasattr(self.model, 'named_steps'):
                info["pipeline_steps"] = list(self.model.named_steps.keys())
        except Exception:
            pass

        return info


# Singleton instance for application-wide use
_model_loader_instance: Optional[ModelLoader] = None


def get_model_loader() -> ModelLoader:
    """
    Get or create the singleton ModelLoader instance.

    Returns:
        ModelLoader instance
    """
    global _model_loader_instance

    if _model_loader_instance is None:
        _model_loader_instance = ModelLoader()

    return _model_loader_instance


def initialize_model() -> ModelLoader:
    """
    Initialize and load the model.

    This should be called at application startup.

    Returns:
        Loaded ModelLoader instance

    Raises:
        Exception: If model loading fails
    """
    loader = get_model_loader()
    if not loader.is_loaded():
        loader.load()
    return loader


__all__ = ['ModelLoader', 'get_model_loader', 'initialize_model']
