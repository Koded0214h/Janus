"""API authentication: a single shared-secret header, appropriate for the single-operator,
self-hosted scope this project is deliberately staying inside (PRD §4 kill list — no
multi-tenant auth system, no user management).

Fails closed: if JANUS_API_KEY isn't set, every protected route is rejected, not silently
opened up. Missing the env var must never be equivalent to no auth.
"""

import secrets

from fastapi import Depends, Header, HTTPException, status

from app.config import Settings, get_settings


def require_api_key(
    x_api_key: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    if not settings.api_key or not x_api_key or not secrets.compare_digest(x_api_key, settings.api_key):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid or missing API key")
