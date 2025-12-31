# Configuration Module

Centralized, modular configuration system for the ML microservice.

## Structure

```
config/
├── __init__.py                  # Configuration manager and loader
├── settings.py                  # Application settings (paths, API config)
├── preprocessing.py             # Text preprocessing functions
├── cluster_mapping.json         # Cluster → Urgency/Priority mapping
├── response_templates.json      # Fallback response templates
└── README.md                    # This file
```

## Usage

### 1. Basic Import

```python
from config import settings, preprocessing, config_manager
```

### 2. Text Preprocessing

```python
from config import preprocessing

# Clean text
raw_text = "Hi @support! Internet mati total!!! #urgent"
cleaned = preprocessing.clean_text(raw_text)
# Output: 'hi internet mati total urgent'

# Validate input
is_valid, error = preprocessing.validate_text_input(raw_text)
if not is_valid:
    print(f"Error: {error}")
```

### 3. Access Settings

```python
from config import settings

# Model configuration
print(settings.MODEL_PATH)
print(settings.MODEL_VERSION)

# API configuration
print(settings.API_HOST)
print(settings.API_PORT)

# Validation
is_valid, errors = settings.validate_settings()
if not is_valid:
    for error in errors:
        print(f"Config error: {error}")

# Display all settings
config_dict = settings.display_settings()
print(config_dict)
```

### 4. Cluster Configuration

```python
from config import config_manager, get_cluster_config

# Get full cluster config
cluster_0_config = get_cluster_config(0)
print(cluster_0_config["urgency"])     # "Low"
print(cluster_0_config["priority"])    # "P3"
print(cluster_0_config["description"]) # Description text

# Get urgency and priority directly
from config import get_urgency_priority
urgency, priority = get_urgency_priority(3)
print(urgency, priority)  # "High", "P1"

# Check auto-escalation
from config import should_auto_escalate
if should_auto_escalate(3):
    print("This cluster requires immediate escalation!")
```

### 5. Response Templates (Fallback)

```python
from config import get_fallback_response

# Get template by urgency
fallback = get_fallback_response("High")
print(fallback)
# Output: "Mohon maaf yang sebesar-besarnya..."

# Access full template data
templates = config_manager.get_response_templates()
high_template = templates["templates"]["High"]
print(high_template["summary"])
print(high_template["tone"])
```

### 6. Configuration Validation

```python
from config import config_manager

# Validate all configurations
is_valid, errors = config_manager.validate_configuration()
if not is_valid:
    print("Configuration errors found:")
    for error in errors:
        print(f"  - {error}")
```

### 7. Hot Reload (Development)

```python
from config import config_manager

# Reload all configurations without restarting
config_manager.reload_all()
print("Configurations reloaded!")
```

## Environment Variables

The following environment variables can be used to customize the service:

| Variable | Default | Description |
|----------|---------|-------------|
| `API_HOST` | `0.0.0.0` | API server host |
| `API_PORT` | `8000` | API server port |
| `API_RELOAD` | `true` | Enable auto-reload in development |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` | Allowed CORS origins |
| `CONFIDENCE_THRESHOLD` | `0.7` | Minimum confidence for predictions |
| `MAX_TEXT_LENGTH` | `10000` | Maximum input text length |
| `MAX_BATCH_SIZE` | `100` | Maximum batch prediction size |
| `LOG_LEVEL` | `INFO` | Logging level |
| `ENABLE_METADATA` | `true` | Include detailed metadata in responses |
| `ENABLE_TIMING` | `true` | Track response times |

## File Formats

### cluster_mapping.json

```json
{
  "clusters": {
    "0": {
      "urgency": "Low",
      "priority": "P3",
      "description": "...",
      "keywords": [...],
      "auto_escalate": false
    }
  }
}
```

### response_templates.json

```json
{
  "templates": {
    "Low": {
      "summary": "...",
      "reply": "...",
      "tone": "friendly"
    }
  }
}
```

## Best Practices

1. **Never hardcode paths** - Always use `settings.MODEL_PATH`, etc.
2. **Validate early** - Call `validate_settings()` at startup
3. **Use convenience functions** - Prefer `get_urgency_priority()` over manual dict access
4. **Cache aware** - Configuration files are cached after first load
5. **Environment-specific** - Use environment variables for deployment differences

## Testing Configuration

```python
# Quick validation test
if __name__ == "__main__":
    from config import config_manager, settings

    # Validate everything
    is_valid, errors = config_manager.validate_configuration()

    if is_valid:
        print("✅ All configurations valid!")
        print("\nSettings:")
        import json
        print(json.dumps(settings.display_settings(), indent=2))
    else:
        print("❌ Configuration errors:")
        for error in errors:
            print(f"  - {error}")
```
