from decimal import Decimal

from fastapi.testclient import TestClient

from app.auth import require_api_key
from app.deps import get_db
from app.domain import PolicyConfig
from app.main import app
from app.models import PolicyModel
from app.policy import create_new_version, get_active_policy


def make_policy(**overrides) -> PolicyConfig:
    defaults = dict(
        version=0,
        daily_cap_ngn=Decimal("2000"),
        per_tx_cap_ngn=Decimal("1000"),
        approval_threshold_ngn=Decimal("500"),
        allowed_categories=frozenset({"delivery"}),
        allowed_recipients=frozenset({"rider_1"}),
        velocity_limit_count=10,
        velocity_window_seconds=3600,
    )
    defaults.update(overrides)
    return PolicyConfig(**defaults)


def test_create_new_version_deactivates_the_previous_one(db):
    first = create_new_version(db, make_policy())
    assert first.version == 1
    assert first.is_active is True

    second = create_new_version(db, make_policy(daily_cap_ngn=Decimal("5000")))
    assert second.version == 2
    assert second.is_active is True

    db.refresh(first)
    assert first.is_active is False


def test_get_active_policy_reflects_the_latest_version(db):
    create_new_version(db, make_policy())
    create_new_version(db, make_policy(daily_cap_ngn=Decimal("9999"), velocity_limit_count=42))

    active = get_active_policy(db)

    assert active.version == 2
    assert active.daily_cap_ngn == Decimal("9999")
    assert active.velocity_limit_count == 42


def test_post_policy_creates_a_new_version_via_the_api(db):
    db.query(PolicyModel).delete()
    db.commit()

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_api_key] = lambda: None
    client = TestClient(app)

    response = client.post(
        "/policy",
        json={
            "daily_cap_ngn": "3000",
            "per_tx_cap_ngn": "1500",
            "approval_threshold_ngn": "800",
            "allowed_categories": ["delivery", "airtime"],
            "allowed_recipients": ["rider_1"],
            "velocity_limit_count": 20,
            "velocity_window_seconds": 3600,
        },
    )
    get_response = client.get("/policy")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["version"] == 1
    assert body["daily_cap_ngn"] == "3000.00"
    assert body["allowed_categories"] == ["airtime", "delivery"]

    assert get_response.json()["version"] == 1
    assert get_response.json()["daily_cap_ngn"] == "3000.00"


def test_post_policy_requires_the_api_key(db):
    db.query(PolicyModel).delete()
    db.commit()

    from app.config import Settings, get_settings

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_settings] = lambda: Settings(api_key="test-key")
    client = TestClient(app)

    body = {
        "daily_cap_ngn": "3000",
        "per_tx_cap_ngn": "1500",
        "approval_threshold_ngn": "800",
        "allowed_categories": ["delivery"],
        "allowed_recipients": ["rider_1"],
        "velocity_limit_count": 20,
        "velocity_window_seconds": 3600,
    }
    no_key_response = client.post("/policy", json=body)
    right_key_response = client.post("/policy", json=body, headers={"X-API-Key": "test-key"})
    app.dependency_overrides.clear()

    assert no_key_response.status_code == 401
    assert right_key_response.status_code == 200
