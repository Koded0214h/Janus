"""ApprovalService: the blocking human-in-the-loop wait, and race-safe resolution.

Real Postgres, real threads — the whole point is proving the wait actually blocks until
resolved and actually gives up (deny-on-timeout) when nobody answers.
"""

import threading
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import sessionmaker

from app.approvals.base import ApprovalChannel, ApprovalRequest
from app.approvals.service import ApprovalCapacityExceededError, ApprovalService, resolve
from app.domain import ApprovalOutcome, PaymentIntent, Verdict
from app.models import ApprovalModel, DecisionModel, IntentModel


@dataclass
class FakeChannel(ApprovalChannel):
    name: str = "fake"
    sent: list[ApprovalRequest] = field(default_factory=list)

    def notify(self, request: ApprovalRequest) -> None:
        self.sent.append(request)


def _make_decision(db) -> DecisionModel:
    intent_model = IntentModel(
        idempotency_key=f"approval-test-{time.time_ns()}",
        amount_ngn=Decimal("750"),
        recipient="rider_1",
        category="delivery",
        reason="test",
    )
    db.add(intent_model)
    db.flush()
    decision_model = DecisionModel(
        intent_id=intent_model.id,
        verdict=Verdict.NEEDS_APPROVAL,
        reason="amount exceeds approval threshold",
        policy_version=1,
    )
    db.add(decision_model)
    db.commit()
    db.refresh(decision_model)
    return decision_model


def make_service(engine, channel: ApprovalChannel, timeout_seconds: int) -> ApprovalService:
    return ApprovalService(
        channel=channel,
        session_factory=sessionmaker(bind=engine),
        base_url="http://localhost:8000",
        timeout_seconds=timeout_seconds,
        poll_interval_seconds=0.05,
    )


def test_notifies_channel_with_a_working_review_link(db, engine):
    channel = FakeChannel()
    service = make_service(engine, channel, timeout_seconds=1)
    decision = _make_decision(db)
    intent = PaymentIntent(
        amount_ngn=Decimal("750"), recipient="rider_1", category="delivery", reason="test", idempotency_key="x"
    )

    service.request_and_wait(db, decision, intent)

    assert len(channel.sent) == 1
    assert channel.sent[0].review_url.startswith("http://localhost:8000/approvals/")
    assert channel.sent[0].token in channel.sent[0].review_url


def test_returns_approved_when_resolved_before_timeout(db, engine):
    channel = FakeChannel()
    service = make_service(engine, channel, timeout_seconds=5)
    decision = _make_decision(db)
    intent = PaymentIntent(
        amount_ngn=Decimal("750"), recipient="rider_1", category="delivery", reason="test", idempotency_key="y"
    )

    def click_approve_shortly_after():
        time.sleep(0.15)
        token = channel.sent[0].token if channel.sent else None
        while token is None:
            time.sleep(0.02)
            token = channel.sent[0].token if channel.sent else None
        with sessionmaker(bind=engine)() as resolver_db:
            resolve(resolver_db, token, ApprovalOutcome.APPROVED)

    resolver = threading.Thread(target=click_approve_shortly_after)
    resolver.start()
    outcome = service.request_and_wait(db, decision, intent)
    resolver.join()

    assert outcome == ApprovalOutcome.APPROVED


def test_returns_denied_when_denied_before_timeout(db, engine):
    channel = FakeChannel()
    service = make_service(engine, channel, timeout_seconds=5)
    decision = _make_decision(db)
    intent = PaymentIntent(
        amount_ngn=Decimal("750"), recipient="rider_1", category="delivery", reason="test", idempotency_key="z"
    )

    def click_deny_shortly_after():
        time.sleep(0.15)
        with sessionmaker(bind=engine)() as resolver_db:
            resolve(resolver_db, channel.sent[0].token, ApprovalOutcome.DENIED)

    resolver = threading.Thread(target=click_deny_shortly_after)
    resolver.start()
    outcome = service.request_and_wait(db, decision, intent)
    resolver.join()

    assert outcome == ApprovalOutcome.DENIED


def test_times_out_to_deny_when_nobody_answers(db, engine):
    channel = FakeChannel()
    service = make_service(engine, channel, timeout_seconds=1)
    decision = _make_decision(db)
    intent = PaymentIntent(
        amount_ngn=Decimal("750"), recipient="rider_1", category="delivery", reason="test", idempotency_key="w"
    )

    outcome = service.request_and_wait(db, decision, intent)

    assert outcome == ApprovalOutcome.EXPIRED
    db.expire_all()
    approval = db.query(ApprovalModel).filter_by(token=channel.sent[0].token).one()
    assert approval.status == ApprovalOutcome.EXPIRED
    assert approval.resolved_at is not None


def test_wait_capacity_limit_raises_immediately(db, engine):
    channel = FakeChannel()
    service = ApprovalService(
        channel=channel,
        session_factory=sessionmaker(bind=engine),
        base_url="http://localhost:8000",
        timeout_seconds=5,
        poll_interval_seconds=0.05,
        max_pending_waiters=1,
    )
    first_decision = _make_decision(db)
    second_decision = _make_decision(db)
    first_intent = PaymentIntent(
        amount_ngn=Decimal("750"), recipient="rider_1", category="delivery", reason="test", idempotency_key="cap-1"
    )
    second_intent = PaymentIntent(
        amount_ngn=Decimal("750"), recipient="rider_1", category="delivery", reason="test", idempotency_key="cap-2"
    )

    started = threading.Event()
    first_outcome = {}

    def wait_on_first_request():
        started.set()
        first_outcome["outcome"] = service.request_and_wait(db, first_decision, first_intent)

    worker = threading.Thread(target=wait_on_first_request)
    worker.start()
    started.wait(timeout=1)

    while not channel.sent:
        time.sleep(0.02)

    try:
        try:
            service.request_and_wait(db, second_decision, second_intent)
            assert False, "expected approval capacity error"
        except ApprovalCapacityExceededError:
            pass
    finally:
        with sessionmaker(bind=engine)() as resolver_db:
            resolve(resolver_db, channel.sent[0].token, ApprovalOutcome.DENIED)
        worker.join()

    assert first_outcome["outcome"] == ApprovalOutcome.DENIED


def test_resolve_is_race_safe_only_first_call_wins(db):
    decision = _make_decision(db)
    approval = ApprovalModel(
        decision_id=decision.id,
        token="race-token",
        status=ApprovalOutcome.PENDING,
        channel="fake",
        expires_at=datetime.now(UTC) + timedelta(seconds=60),
    )
    db.add(approval)
    db.commit()

    first = resolve(db, "race-token", ApprovalOutcome.APPROVED)
    second = resolve(db, "race-token", ApprovalOutcome.DENIED)

    assert first.status == ApprovalOutcome.APPROVED
    assert second.status == ApprovalOutcome.APPROVED  # the deny attempt did not overwrite it


def test_resolve_returns_none_for_unknown_token(db):
    assert resolve(db, "no-such-token", ApprovalOutcome.APPROVED) is None


def test_resolve_refuses_to_resolve_an_already_expired_row(db):
    decision = _make_decision(db)
    approval = ApprovalModel(
        decision_id=decision.id,
        token="expired-token",
        status=ApprovalOutcome.PENDING,
        channel="fake",
        expires_at=datetime.now(UTC) - timedelta(seconds=1),  # already in the past
    )
    db.add(approval)
    db.commit()

    result = resolve(db, "expired-token", ApprovalOutcome.APPROVED)

    assert result.status == ApprovalOutcome.PENDING  # refused — a sweep/poll loop must expire it, not a late click
