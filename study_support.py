"""Shared, dependency-free helpers for every study notebook."""

from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent


def load_anthropic_api_key() -> str:
    """Load ANTHROPIC_API_KEY from the process or the project's root .env."""
    if key := os.environ.get("ANTHROPIC_API_KEY"):
        return key

    env_path = ROOT / ".env"
    if env_path.exists():
        for raw_line in env_path.read_text().splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            name, value = line.split("=", 1)
            if name.strip() == "ANTHROPIC_API_KEY":
                key = value.strip().strip('"').strip("'")
                if key:
                    os.environ["ANTHROPIC_API_KEY"] = key
                    return key

    raise RuntimeError(
        "ANTHROPIC_API_KEY is missing. Copy .env.example to .env and add the key."
    )


def messages_create(payload: dict, *, api_version: str = "2023-06-01") -> dict:
    """Call the Messages API with stdlib only; intended for optional live cells."""
    request = Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode(),
        headers={
            "x-api-key": load_anthropic_api_key(),
            "anthropic-version": api_version,
            "content-type": "application/json",
        },
        method="POST",
    )
    with urlopen(request, timeout=60) as response:
        return json.load(response)

