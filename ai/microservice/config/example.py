"""
Configuration Module Example & Test Script

Run this script to verify that all configurations are properly set up.

Usage:
    python -m config.example
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import (
    settings,
    preprocessing,
    config_manager,
    get_cluster_config,
    get_urgency_priority,
    should_auto_escalate,
    get_fallback_response,
)


def print_section(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_preprocessing():
    """Test preprocessing functions."""
    print_section("1. PREPROCESSING TESTS")

    test_cases = [
        "Hi @support! Check https://example.com #urgent",
        "Internet mati total dari pagi!!! Rugi 100rb",
        "Terima kasih min, sangat membantu 😊",
        "",  # Empty string
        None,  # None value
    ]

    for i, text in enumerate(test_cases, 1):
        print(f"\nTest {i}:")
        print(f"  Input:  {repr(text)}")

        # Validate
        is_valid, error = preprocessing.validate_text_input(text)
        print(f"  Valid:  {is_valid}")
        if not is_valid:
            print(f"  Error:  {error}")
            continue

        # Clean
        cleaned = preprocessing.clean_text(text)
        print(f"  Output: {repr(cleaned)}")


def test_settings():
    """Test settings configuration."""
    print_section("2. SETTINGS TESTS")

    print("\nModel Configuration:")
    print(f"  Version:    {settings.MODEL_VERSION}")
    print(f"  Path:       {settings.MODEL_PATH}")
    print(f"  Exists:     {settings.MODEL_PATH.exists()}")

    print("\nAPI Configuration:")
    print(f"  Host:       {settings.API_HOST}")
    print(f"  Port:       {settings.API_PORT}")
    print(f"  Version:    {settings.API_VERSION}")
    print(f"  Prefix:     {settings.API_PREFIX}")

    print("\nInference Configuration:")
    print(f"  Confidence: {settings.CONFIDENCE_THRESHOLD}")
    print(f"  Max Length: {settings.MAX_TEXT_LENGTH}")
    print(f"  Max Batch:  {settings.MAX_BATCH_SIZE}")

    print("\nValidation:")
    is_valid, errors = settings.validate_settings()
    if is_valid:
        print("  ✅ All settings valid!")
    else:
        print("  ❌ Errors found:")
        for error in errors:
            print(f"    - {error}")


def test_cluster_mapping():
    """Test cluster mapping configuration."""
    print_section("3. CLUSTER MAPPING TESTS")

    for cluster_id in range(4):
        print(f"\nCluster {cluster_id}:")

        # Get full config
        config = get_cluster_config(cluster_id)
        print(f"  Urgency:      {config['urgency']}")
        print(f"  Priority:     {config['priority']}")
        print(f"  Description:  {config['description'][:50]}...")
        print(f"  Keywords:     {', '.join(config['keywords'][:5])}")
        print(f"  Auto-escalate: {config['auto_escalate']}")

        # Test convenience functions
        urgency, priority = get_urgency_priority(cluster_id)
        escalate = should_auto_escalate(cluster_id)
        print(f"  → get_urgency_priority(): ({urgency}, {priority})")
        print(f"  → should_auto_escalate(): {escalate}")


def test_response_templates():
    """Test response templates."""
    print_section("4. RESPONSE TEMPLATES TESTS")

    for urgency in ["Low", "Medium", "High"]:
        print(f"\n{urgency} Urgency:")
        response = get_fallback_response(urgency)
        print(f"  {response[:80]}...")


def test_validation():
    """Test full configuration validation."""
    print_section("5. FULL VALIDATION")

    is_valid, errors = config_manager.validate_configuration()

    if is_valid:
        print("\n  ✅ ALL CONFIGURATIONS VALID!")
        print("\n  Configuration system is ready for production use.")
    else:
        print("\n  ❌ VALIDATION ERRORS FOUND:")
        for error in errors:
            print(f"    - {error}")
        print("\n  Please fix the errors above before running the service.")

    return is_valid


def main():
    """Run all configuration tests."""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 58 + "║")
    print("║" + "  ML MICROSERVICE - CONFIGURATION TEST SUITE".center(58) + "║")
    print("║" + " " * 58 + "║")
    print("╚" + "=" * 58 + "╝")

    try:
        test_preprocessing()
        test_settings()
        test_cluster_mapping()
        test_response_templates()
        is_valid = test_validation()

        print_section("SUMMARY")
        if is_valid:
            print("\n  ✅ Configuration system is properly set up!")
            print("  ✅ Ready to implement the inference API")
            return 0
        else:
            print("\n  ❌ Please fix configuration errors")
            return 1

    except Exception as e:
        print_section("ERROR")
        print(f"\n  ❌ Test failed with exception:")
        print(f"     {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
