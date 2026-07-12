import pytest
from fastapi import HTTPException

from app.auth import require_api_key
from app.config import Settings


def test_rejects_missing_key():
    with pytest.raises(HTTPException) as exc:
        require_api_key(x_api_key=None, settings=Settings(api_key="secret"))
    assert exc.value.status_code == 401


def test_rejects_wrong_key():
    with pytest.raises(HTTPException) as exc:
        require_api_key(x_api_key="wrong", settings=Settings(api_key="secret"))
    assert exc.value.status_code == 401


def test_accepts_correct_key():
    require_api_key(x_api_key="secret", settings=Settings(api_key="secret"))  # does not raise


def test_fails_closed_when_no_key_configured():
    """An unset API_KEY must reject everything, not silently allow requests through."""
    with pytest.raises(HTTPException) as exc:
        require_api_key(x_api_key="anything", settings=Settings(api_key=""))
    assert exc.value.status_code == 401

    with pytest.raises(HTTPException):
        require_api_key(x_api_key=None, settings=Settings(api_key=""))
