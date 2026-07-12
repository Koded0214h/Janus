"""No live server needed — httpx.MockTransport stands in for the real Janus API, so these
tests are fast and self-contained. Live end-to-end verification against a real backend was
done manually (see the SDK README's smoke-test snippet)."""

import json
from datetime import datetime
from decimal import Decimal

import httpx
import pytest

from janus_sdk import Janus, JanusAPIError, JanusAuthError
from janus_sdk.models import Decision, Policy

DECISION_JSON = {
    "id": "dec_1",
    "status": "allowed",
    "reason": "within budget, category, recipient, and velocity limits",
    "policy_version": 1,
    "evaluated_at": "2026-07-12T17:23:34+00:00",
    "is_replay": False,
    "remaining_daily_ngn": "1850.00",
    "receipt": {"rail": "paystack", "rail_reference": "TRF_8x2", "amount_ngn": "150.00", "status": "success"},
    "approval_url": None,
    "expires_at": None,
}

POLICY_JSON = {
    "version": 1,
    "daily_cap_ngn": "2000.00",
    "per_tx_cap_ngn": "1000.00",
    "approval_threshold_ngn": "500.00",
    "allowed_categories": ["delivery"],
    "allowed_recipients": ["rider_1"],
    "velocity_limit_count": 10,
    "velocity_window_seconds": 3600,
}

AUDIT_JSON = [
    {
        "intent_id": 1,
        "idempotency_key": "demo-1",
        "amount_ngn": "150.00",
        "recipient": "rider_1",
        "category": "delivery",
        "reason": "delivery fee",
        "received_at": "2026-07-12T17:23:34+00:00",
        "verdict": "allow",
        "decision_reason": "within budget, category, recipient, and velocity limits",
        "policy_version": 1,
        "evaluated_at": "2026-07-12T17:23:34+00:00",
        "transfer_reference": "TRF_8x2",
        "transfer_status": "success",
    }
]


def client_with(handler) -> Janus:
    return Janus(base_url="http://testserver", api_key="test-key", transport=httpx.MockTransport(handler))


def test_pay_returns_a_typed_decision():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/intents"
        return httpx.Response(200, json=DECISION_JSON)

    with client_with(handler) as janus:
        decision = janus.pay(amount_ngn=150, recipient="rider_1", category="delivery", reason="delivery fee")

    assert isinstance(decision, Decision)
    assert decision.status == "allowed"
    assert decision.allowed is True
    assert decision.remaining_daily_ngn == Decimal("1850.00")
    assert decision.receipt.rail_reference == "TRF_8x2"
    assert decision.receipt.amount_ngn == Decimal("150.00")
    assert isinstance(decision.evaluated_at, datetime)
    assert decision.expires_at is None


def test_pay_generates_an_idempotency_key_when_none_given():
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["body"] = json.loads(request.content)
        return httpx.Response(200, json=DECISION_JSON)

    with client_with(handler) as janus:
        janus.pay(amount_ngn=150, recipient="rider_1", category="delivery", reason="x")

    assert seen["body"]["idempotency_key"]  # non-empty, auto-generated


def test_pay_uses_the_provided_idempotency_key():
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["body"] = json.loads(request.content)
        return httpx.Response(200, json=DECISION_JSON)

    with client_with(handler) as janus:
        janus.pay(amount_ngn=150, recipient="rider_1", category="delivery", reason="x", idempotency_key="order-42")

    assert seen["body"]["idempotency_key"] == "order-42"


def test_get_policy_returns_a_typed_policy():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/policy"
        assert request.method == "GET"
        return httpx.Response(200, json=POLICY_JSON)

    with client_with(handler) as janus:
        policy = janus.get_policy()

    assert isinstance(policy, Policy)
    assert policy.daily_cap_ngn == Decimal("2000.00")
    assert policy.allowed_recipients == ["rider_1"]


def test_set_policy_posts_the_right_body_and_parses_the_response():
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST"
        seen["body"] = json.loads(request.content)
        return httpx.Response(200, json={**POLICY_JSON, "version": 2})

    with client_with(handler) as janus:
        policy = janus.set_policy(
            daily_cap_ngn=2000,
            per_tx_cap_ngn=1000,
            approval_threshold_ngn=500,
            allowed_categories=["delivery"],
            allowed_recipients=["rider_1"],
            velocity_limit_count=10,
            velocity_window_seconds=3600,
        )

    assert policy.version == 2
    assert seen["body"]["daily_cap_ngn"] == "2000"
    assert seen["body"]["allowed_categories"] == ["delivery"]


def test_get_audit_returns_typed_entries():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/audit"
        return httpx.Response(200, json=AUDIT_JSON)

    with client_with(handler) as janus:
        entries = janus.get_audit()

    assert len(entries) == 1
    assert entries[0].verdict == "allow"  # note: raw engine verdict, not "allowed"
    assert entries[0].amount_ngn == Decimal("150.00")


def test_401_raises_janus_auth_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"detail": "invalid or missing API key"})

    with client_with(handler) as janus, pytest.raises(JanusAuthError):
        janus.get_policy()


def test_other_error_raises_janus_api_error_with_details():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(422, text="validation error")

    with client_with(handler) as janus:
        with pytest.raises(JanusAPIError) as exc:
            janus.get_policy()

    assert exc.value.status_code == 422
    assert "validation error" in exc.value.body


def test_missing_api_key_raises_at_construction():
    with pytest.raises(ValueError):
        Janus(base_url="http://testserver", api_key="")


def test_api_key_header_sent_on_every_request():
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["header"] = request.headers.get("x-api-key")
        return httpx.Response(200, json=POLICY_JSON)

    with client_with(handler) as janus:
        janus.get_policy()

    assert seen["header"] == "test-key"
