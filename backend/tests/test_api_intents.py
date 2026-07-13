import threading
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.approvals.service import ApprovalService, resolve
from app.auth import require_api_key
from app.deps import get_approval_service, get_db, get_executor, get_ledger
from app.domain import ApprovalOutcome, PaymentIntent
from app.executors.base import Executor, TransferResult
from app.main import app
from app.models import PolicyModel
from tests.test_approvals import FakeChannel


@dataclass
class FakeExecutor(Executor):
    should_succeed: bool = True

    def execute(self, intent: PaymentIntent) -> TransferResult:
        if self.should_succeed:
            return TransferResult(
                success=True, rail="paystack", reference=f"ref-{intent.idempotency_key}", status="success", raw_message="ok"
            )
        return TransferResult(success=False, rail="paystack", reference=None, status="failed", raw_message="declined")


def _seed_policy(db, approval_threshold_ngn: str = "100000"):
    db.query(PolicyModel).delete()
    db.add(
        PolicyModel(
            version=1,
            daily_cap_ngn="1000",
            per_tx_cap_ngn="1000",
            approval_threshold_ngn=approval_threshold_ngn,
            allowed_categories=["delivery"],
            allowed_recipients=["rider_1"],
            velocity_limit_count=1000,
            velocity_window_seconds=3600,
            is_active=True,
        )
    )
    db.commit()


def client_with_executor(db, ledger, should_succeed: bool, approval_service: ApprovalService | None = None) -> TestClient:
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_ledger] = lambda: ledger
    app.dependency_overrides[get_executor] = lambda: FakeExecutor(should_succeed=should_succeed)
    app.dependency_overrides[require_api_key] = lambda: None  # auth mechanics covered separately in test_auth.py
    if approval_service is not None:
        app.dependency_overrides[get_approval_service] = lambda: approval_service
    return TestClient(app)


def test_successful_transfer_keeps_the_reservation(db, ledger, redis_client):
    _seed_policy(db)
    client = client_with_executor(db, ledger, should_succeed=True)

    response = client.post(
        "/intents",
        json={
            "amount_ngn": "150",
            "recipient": "rider_1",
            "category": "delivery",
            "reason": "delivery fee",
            "idempotency_key": "api-success-1",
        },
    )
    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "allowed"
    assert body["receipt"]["status"] == "success"
    assert body["receipt"]["rail_reference"] == "ref-api-success-1"
    assert body["remaining_daily_ngn"] == "850.00"  # 1000 daily cap - 150 spent

    key = ledger._daily_key(datetime.now(UTC).date())
    assert redis_client.get(key) == "150"


def test_failed_transfer_rolls_back_the_reservation(db, ledger, redis_client):
    _seed_policy(db)
    client = client_with_executor(db, ledger, should_succeed=False)

    response = client.post(
        "/intents",
        json={
            "amount_ngn": "150",
            "recipient": "rider_1",
            "category": "delivery",
            "reason": "delivery fee",
            "idempotency_key": "api-fail-1",
        },
    )
    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "allowed"  # the decision was correct, the rail is what failed
    assert body["receipt"]["status"] == "failed"

    key = ledger._daily_key(datetime.now(UTC).date())
    assert redis_client.get(key) in (None, "0")


def test_replay_returns_the_same_transfer_reference(db, ledger, redis_client):
    _seed_policy(db)
    client = client_with_executor(db, ledger, should_succeed=True)

    payload = {
        "amount_ngn": "150",
        "recipient": "rider_1",
        "category": "delivery",
        "reason": "delivery fee",
        "idempotency_key": "api-replay-1",
    }
    first = client.post("/intents", json=payload).json()
    second = client.post("/intents", json=payload).json()
    app.dependency_overrides.clear()

    assert first["receipt"]["rail_reference"] == second["receipt"]["rail_reference"]
    assert second["is_replay"] is True

    key = ledger._daily_key(datetime.now(UTC).date())
    assert redis_client.get(key) == "150"  # replay never spends a second time


def test_float_ceiling_denies_even_when_policy_would_allow(db, ledger_factory, redis_client):
    _seed_policy(db)  # daily_cap_ngn=1000, well above the tiny float limit below
    tiny_float_ledger = ledger_factory(Decimal("100"))
    client = client_with_executor(db, tiny_float_ledger, should_succeed=True)

    response = client.post(
        "/intents",
        json={
            "amount_ngn": "150",
            "recipient": "rider_1",
            "category": "delivery",
            "reason": "delivery fee",
            "idempotency_key": "api-float-ceiling-1",
        },
    )
    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "denied"
    assert "float ceiling" in body["reason"]
    assert body["receipt"] is None


def _approval_service(engine, timeout_seconds: int) -> tuple[ApprovalService, FakeChannel]:
    channel = FakeChannel()
    service = ApprovalService(
        channel=channel,
        session_factory=sessionmaker(bind=engine),
        base_url="http://localhost:8000",
        timeout_seconds=timeout_seconds,
        poll_interval_seconds=0.05,
    )
    return service, channel


def test_needs_approval_then_approved_executes_the_transfer(db, ledger, engine, redis_client):
    _seed_policy(db, approval_threshold_ngn="100")  # 750 will need approval
    service, channel = _approval_service(engine, timeout_seconds=5)
    client = client_with_executor(db, ledger, should_succeed=True, approval_service=service)

    def click_approve():
        time.sleep(0.15)
        while not channel.sent:
            time.sleep(0.02)
        with sessionmaker(bind=engine)() as resolver_db:
            resolve(resolver_db, channel.sent[0].token, ApprovalOutcome.APPROVED)

    resolver = threading.Thread(target=click_approve)
    resolver.start()
    response = client.post(
        "/intents",
        json={
            "amount_ngn": "750",
            "recipient": "rider_1",
            "category": "delivery",
            "reason": "big one",
            "idempotency_key": "api-approval-approved-1",
        },
    )
    resolver.join()
    app.dependency_overrides.clear()

    body = response.json()
    assert body["status"] == "allowed"
    assert body["reason"] == "approved by human reviewer"
    assert body["receipt"]["status"] == "success"

    key = ledger._daily_key(datetime.now(UTC).date())
    assert redis_client.get(key) == "750"  # kept, since it was approved


def test_needs_approval_then_denied_releases_the_budget(db, ledger, engine, redis_client):
    _seed_policy(db, approval_threshold_ngn="100")
    service, channel = _approval_service(engine, timeout_seconds=5)
    client = client_with_executor(db, ledger, should_succeed=True, approval_service=service)

    def click_deny():
        time.sleep(0.15)
        while not channel.sent:
            time.sleep(0.02)
        with sessionmaker(bind=engine)() as resolver_db:
            resolve(resolver_db, channel.sent[0].token, ApprovalOutcome.DENIED)

    resolver = threading.Thread(target=click_deny)
    resolver.start()
    response = client.post(
        "/intents",
        json={
            "amount_ngn": "750",
            "recipient": "rider_1",
            "category": "delivery",
            "reason": "big one",
            "idempotency_key": "api-approval-denied-1",
        },
    )
    resolver.join()
    app.dependency_overrides.clear()

    body = response.json()
    assert body["status"] == "denied"
    assert body["reason"] == "denied by human reviewer"
    assert body["receipt"] is None

    key = ledger._daily_key(datetime.now(UTC).date())
    assert redis_client.get(key) in (None, "0")


def test_needs_approval_times_out_to_deny(db, ledger, engine, redis_client):
    _seed_policy(db, approval_threshold_ngn="100")
    service, channel = _approval_service(engine, timeout_seconds=1)  # nobody will answer
    client = client_with_executor(db, ledger, should_succeed=True, approval_service=service)

    response = client.post(
        "/intents",
        json={
            "amount_ngn": "750",
            "recipient": "rider_1",
            "category": "delivery",
            "reason": "big one",
            "idempotency_key": "api-approval-timeout-1",
        },
    )
    app.dependency_overrides.clear()

    body = response.json()
    assert body["status"] == "denied"
    assert "timed out" in body["reason"]
    assert body["receipt"] is None

    key = ledger._daily_key(datetime.now(UTC).date())
    assert redis_client.get(key) in (None, "0")


def test_approval_queue_limit_fails_fast_and_releases_the_budget(db, ledger, engine, redis_client):
    _seed_policy(db, approval_threshold_ngn="100")
    channel = FakeChannel()
    service = ApprovalService(
        channel=channel,
        session_factory=sessionmaker(bind=engine),
        base_url="http://localhost:8000",
        timeout_seconds=5,
        poll_interval_seconds=0.05,
        max_pending_waiters=1,
    )
    client = client_with_executor(db, ledger, should_succeed=True, approval_service=service)

    def first_request():
        return client.post(
            "/intents",
            json={
                "amount_ngn": "750",
                "recipient": "rider_1",
                "category": "delivery",
                "reason": "first waiting request",
                "idempotency_key": "api-approval-capacity-1",
            },
        )

    first_response_holder = {}
    worker = threading.Thread(target=lambda: first_response_holder.setdefault("response", first_request()))
    worker.start()

    while not channel.sent:
        time.sleep(0.02)

    second_response = client.post(
        "/intents",
        json={
            "amount_ngn": "750",
            "recipient": "rider_1",
            "category": "delivery",
            "reason": "second waiting request",
            "idempotency_key": "api-approval-capacity-2",
        },
    )

    with sessionmaker(bind=engine)() as resolver_db:
        resolve(resolver_db, channel.sent[0].token, ApprovalOutcome.DENIED)
    worker.join()
    app.dependency_overrides.clear()

    assert second_response.status_code == 503
    assert "too many approval requests" in second_response.json()["detail"]

    key = ledger._daily_key(datetime.now(UTC).date())
    assert redis_client.get(key) in (None, "0")
    assert first_response_holder["response"].status_code == 200


def test_intents_route_actually_requires_the_api_key(db, ledger):
    """Unlike every other test here, this one does NOT override require_api_key — the point
    is to prove the real app rejects unauthenticated requests, not just that the dependency
    function works in isolation (that's test_auth.py)."""
    from app.config import Settings, get_settings

    _seed_policy(db)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_ledger] = lambda: ledger
    app.dependency_overrides[get_executor] = lambda: FakeExecutor(should_succeed=True)
    app.dependency_overrides[get_settings] = lambda: Settings(api_key="test-key")
    client = TestClient(app)

    payload = {
        "amount_ngn": "100",
        "recipient": "rider_1",
        "category": "delivery",
        "reason": "auth test",
        "idempotency_key": "auth-check-1",
    }

    no_key_response = client.post("/intents", json=payload)
    wrong_key_response = client.post("/intents", json=payload, headers={"X-API-Key": "nope"})
    right_key_response = client.post("/intents", json=payload, headers={"X-API-Key": "test-key"})

    app.dependency_overrides.clear()

    assert no_key_response.status_code == 401
    assert wrong_key_response.status_code == 401
    assert right_key_response.status_code == 200
