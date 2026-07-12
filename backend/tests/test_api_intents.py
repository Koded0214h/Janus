from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal

from fastapi.testclient import TestClient

from app.deps import get_db, get_executor, get_ledger
from app.domain import PaymentIntent
from app.executors.base import Executor, TransferResult
from app.main import app
from app.models import PolicyModel


@dataclass
class FakeExecutor(Executor):
    should_succeed: bool = True

    def execute(self, intent: PaymentIntent) -> TransferResult:
        if self.should_succeed:
            return TransferResult(
                success=True, rail="paystack", reference=f"ref-{intent.idempotency_key}", status="success", raw_message="ok"
            )
        return TransferResult(success=False, rail="paystack", reference=None, status="failed", raw_message="declined")


def _seed_policy(db):
    db.query(PolicyModel).delete()
    db.add(
        PolicyModel(
            version=1,
            daily_cap_ngn="1000",
            per_tx_cap_ngn="1000",
            approval_threshold_ngn="100000",
            allowed_categories=["delivery"],
            allowed_recipients=["rider_1"],
            velocity_limit_count=1000,
            velocity_window_seconds=3600,
            is_active=True,
        )
    )
    db.commit()


def client_with_executor(db, ledger, should_succeed: bool) -> TestClient:
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_ledger] = lambda: ledger
    app.dependency_overrides[get_executor] = lambda: FakeExecutor(should_succeed=should_succeed)
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
