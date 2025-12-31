"""
Text Preprocessing Module

This module contains all text preprocessing functions used for
cleaning and normalizing customer support ticket text before
feeding it to the ML model.

The preprocessing pipeline must match exactly what was used during
model training to ensure consistent inference accuracy.
"""

import re
from typing import Optional


def clean_text(text: str) -> str:
    """
    Clean and normalize text for ML model inference.

    This function performs the following operations:
    1. Convert to lowercase
    2. Remove URLs (http/https links)
    3. Remove mentions (@username)
    4. Remove hashtags (#hashtag)
    5. Remove special characters and punctuation
    6. Remove digits
    7. Strip extra whitespace

    Args:
        text: Raw input text from customer ticket

    Returns:
        Cleaned and normalized text ready for vectorization

    Examples:
        >>> clean_text("Hi @support! Check https://example.com #urgent")
        'hi check urgent'

        >>> clean_text("Internet mati total dari pagi!!! Rugi 100rb")
        'internet mati total dari pagi rugi rb'

    Note:
        - Non-string inputs return empty string
        - Must match training preprocessing exactly for accurate predictions
    """
    # Handle non-string inputs
    if not isinstance(text, str):
        return ""

    # Convert to lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r'http\S+', '', text)

    # Remove mentions (@user)
    text = re.sub(r'@\w+', '', text)

    # Remove hashtags (#tag)
    text = re.sub(r'#\w+', '', text)

    # Remove special characters and punctuation (keep only alphanumeric and spaces)
    text = re.sub(r'[^\w\s]', '', text)

    # Remove digits
    text = re.sub(r'\d+', '', text)

    # Strip leading/trailing whitespace
    return text.strip()


def validate_text_input(text: Optional[str]) -> tuple[bool, str]:
    """
    Validate text input before preprocessing.

    Args:
        text: Input text to validate

    Returns:
        Tuple of (is_valid: bool, error_message: str)

    Examples:
        >>> validate_text_input("Hello support")
        (True, "")

        >>> validate_text_input("")
        (False, "Text input is empty")

        >>> validate_text_input(None)
        (False, "Text input is required")
    """
    if text is None:
        return False, "Text input is required"

    if not isinstance(text, str):
        return False, f"Text must be a string, got {type(text).__name__}"

    if not text.strip():
        return False, "Text input is empty"

    if len(text) > 10000:  # Reasonable max length
        return False, "Text input exceeds maximum length (10000 characters)"

    return True, ""


# For backwards compatibility and easier imports
__all__ = ['clean_text', 'validate_text_input']
