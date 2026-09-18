"""Shared setup for the live Claude study notebooks."""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OPENROUTER_BASE_URL = "https://openrouter.ai/api"
DEFAULT_MODEL = "anthropic/claude-sonnet-4.6"


def _load_project_env() -> None:
    """Load the root .env without adding a dotenv dependency."""
    env_path = ROOT / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        os.environ.setdefault(name.strip(), value.strip().strip('"').strip("'"))


def load_openrouter_api_key() -> str:
    """Load OPENROUTER_API_KEY from the process or the project's root .env."""
    _load_project_env()
    if key := os.environ.get("OPENROUTER_API_KEY"):
        return key

    raise RuntimeError(
        "OPENROUTER_API_KEY is missing. Copy .env.example to .env and add the key."
    )


def claude_model() -> str:
    """Return the pinned default model, with one explicit environment override."""
    _load_project_env()
    model = os.environ.get("CLAUDE_MODEL", DEFAULT_MODEL)
    return model if model.startswith("anthropic/") else f"anthropic/{model}"


def claude_client():
    """Create an Anthropic client routed through OpenRouter."""
    try:
        from anthropic import Anthropic
    except ImportError as exc:
        raise RuntimeError("Install dependencies with: python -m pip install -r requirements.txt") from exc

    return Anthropic(
        auth_token=load_openrouter_api_key(),
        api_key="",
        base_url=OPENROUTER_BASE_URL,
    )


def message_text(message) -> str:
    """Join the text blocks in a Claude message."""
    return "".join(block.text for block in message.content if block.type == "text")
