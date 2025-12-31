"""
Configuration Module

Centralized configuration management for the ML microservice.
Provides easy access to all configuration components.

Usage:
    from config import settings, preprocessing, config_manager

    # Use preprocessing
    cleaned = preprocessing.clean_text(raw_text)

    # Access settings
    model_path = settings.MODEL_PATH

    # Load configurations
    cluster_map = config_manager.get_cluster_mapping()
    templates = config_manager.get_response_templates()
"""

import json
from pathlib import Path
from typing import Any, Optional

# Import all configuration modules
from . import settings
from . import preprocessing


class ConfigurationManager:
    """
    Centralized configuration manager that handles loading and caching
    of JSON configuration files.
    """

    def __init__(self):
        self._cluster_mapping: Optional[dict] = None
        self._response_templates: Optional[dict] = None

    def get_cluster_mapping(self, force_reload: bool = False) -> dict:
        """
        Load and cache cluster mapping configuration.

        Args:
            force_reload: If True, reload from file even if cached

        Returns:
            Dictionary containing cluster mapping configuration

        Raises:
            FileNotFoundError: If cluster mapping file doesn't exist
            json.JSONDecodeError: If file contains invalid JSON
        """
        if self._cluster_mapping is None or force_reload:
            with open(settings.CLUSTER_MAPPING_PATH, 'r', encoding='utf-8') as f:
                self._cluster_mapping = json.load(f)

        return self._cluster_mapping

    def get_cluster_config(self, cluster_id: int) -> dict:
        """
        Get configuration for a specific cluster.

        Args:
            cluster_id: Cluster ID (0-3)

        Returns:
            Dictionary with urgency, priority, and metadata for the cluster

        Raises:
            ValueError: If cluster_id is invalid
        """
        mapping = self.get_cluster_mapping()
        cluster_key = str(cluster_id)

        if cluster_key not in mapping["clusters"]:
            raise ValueError(f"Invalid cluster_id: {cluster_id}")

        return mapping["clusters"][cluster_key]

    def get_response_templates(self, force_reload: bool = False) -> dict:
        """
        Load and cache response templates configuration.

        Args:
            force_reload: If True, reload from file even if cached

        Returns:
            Dictionary containing response templates

        Raises:
            FileNotFoundError: If templates file doesn't exist
            json.JSONDecodeError: If file contains invalid JSON
        """
        if self._response_templates is None or force_reload:
            with open(settings.RESPONSE_TEMPLATES_PATH, 'r', encoding='utf-8') as f:
                self._response_templates = json.load(f)

        return self._response_templates

    def get_template_by_urgency(self, urgency: str) -> dict:
        """
        Get response template for a specific urgency level.

        Args:
            urgency: Urgency level (Low, Medium, High)

        Returns:
            Dictionary with summary and reply template

        Raises:
            ValueError: If urgency level is invalid
        """
        templates = self.get_response_templates()

        if urgency not in templates["templates"]:
            raise ValueError(f"Invalid urgency level: {urgency}")

        return templates["templates"][urgency]

    def validate_configuration(self) -> tuple[bool, list[str]]:
        """
        Validate all configuration files and settings.

        Returns:
            Tuple of (is_valid: bool, error_messages: list[str])
        """
        errors = []

        # Validate settings
        settings_valid, settings_errors = settings.validate_settings()
        errors.extend(settings_errors)

        # Validate cluster mapping can be loaded
        try:
            cluster_map = self.get_cluster_mapping()
            if "clusters" not in cluster_map:
                errors.append("Cluster mapping missing 'clusters' key")
        except Exception as e:
            errors.append(f"Failed to load cluster mapping: {e}")

        # Validate response templates can be loaded
        try:
            templates = self.get_response_templates()
            if "templates" not in templates:
                errors.append("Response templates missing 'templates' key")
        except Exception as e:
            errors.append(f"Failed to load response templates: {e}")

        return len(errors) == 0, errors

    def reload_all(self):
        """
        Force reload all cached configurations from files.
        Useful for hot-reloading config changes without restarting service.
        """
        self._cluster_mapping = None
        self._response_templates = None
        self.get_cluster_mapping(force_reload=True)
        self.get_response_templates(force_reload=True)


# Singleton instance for easy import
config_manager = ConfigurationManager()


# Convenience functions for common operations
def get_cluster_config(cluster_id: int) -> dict:
    """Get configuration for a specific cluster."""
    return config_manager.get_cluster_config(cluster_id)


def get_urgency_priority(cluster_id: int) -> tuple[str, str]:
    """
    Get urgency and priority for a cluster.

    Args:
        cluster_id: Cluster ID (0-3)

    Returns:
        Tuple of (urgency: str, priority: str)
    """
    config = get_cluster_config(cluster_id)
    return config["urgency"], config["priority"]


def should_auto_escalate(cluster_id: int) -> bool:
    """Check if cluster should be auto-escalated."""
    config = get_cluster_config(cluster_id)
    return config.get("auto_escalate", False)


def get_fallback_response(urgency: str) -> str:
    """Get fallback response template for urgency level."""
    template = config_manager.get_template_by_urgency(urgency)
    return template["reply"]


# Export all public APIs
__all__ = [
    # Modules
    "settings",
    "preprocessing",
    # Manager
    "config_manager",
    "ConfigurationManager",
    # Convenience functions
    "get_cluster_config",
    "get_urgency_priority",
    "should_auto_escalate",
    "get_fallback_response",
]
