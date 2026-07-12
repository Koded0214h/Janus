"""Ledger correctness under concurrency and retries.

These are the tests the PRD calls out by name: "Decisions are correct and idempotent
under a concurrency test" is the P0 gate. Run against real Redis + Postgres (docker-compose),
not mocks — the whole point is proving the atomic primitives actually hold under a race.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy.orm import sessionmaker

from app.domain import PaymentIntent, PolicyConfig, Verdict
from app.ledger import SpendLedger


def current_daily_total(ledger: SpendLedger) -> Decimal:
    key = ledger._daily_key(datetime.now(UTC).date())
    return Decimal(ledger._redis.get(key) or "0")


def make_intent(idempotency_key: str, amount: str = "100") -> PaymentIntent:
    return PaymentIntent(
        amount_ngn=Decimal(amount),
        recipient="rider_1",
        category="delivery",
        reason="test",
        idempotency_key=idempotency_key,
    )


def test_replaying_same_idempotency_key_never_double_spends(engine, ledger, policy):
    session_factory = sessionmaker(bind=engine)

    def submit(_):
        with session_factory() as db:
            return ledger.process_intent(db, make_intent("dup-key", "100"), policy)

    with ThreadPoolExecutor(max_workers=20) as pool:
        results = list(pool.map(submit, range(20)))

    allowed = [r for r in results if r.decision.verdict == Verdict.ALLOW]
    assert len(allowed) == 20  # every replay reports the same ALLOW decision
    assert sum(1 for r in results if not r.is_replay) == 1  # but only one of them actually did the work

    assert current_daily_total(ledger) == Decimal("100")  # spent exactly once, not 20 times


def test_concurrent_distinct_intents_never_exceed_daily_cap(engine, ledger, policy):
    """policy.daily_cap_ngn is 1000. Fire 30 concurrent 100-naira intents (3000 total demand)
    and prove the ledger allows at most 10 of them through, never overspending the cap."""
    session_factory = sessionmaker(bind=engine)

    def submit(i):
        with session_factory() as db:
            return ledger.process_intent(db, make_intent(f"key-{i}", "100"), policy)

    with ThreadPoolExecutor(max_workers=30) as pool:
        results = list(pool.map(submit, range(30)))

    allowed = [r for r in results if r.decision.verdict == Verdict.ALLOW]
    denied = [r for r in results if r.decision.verdict == Verdict.DENY]

    assert len(allowed) == 10
    assert len(denied) == 20
    assert sum(Decimal("100") for _ in allowed) == Decimal("1000")
    assert current_daily_total(ledger) == Decimal("1000")  # never a cent over the cap, even under a race


def test_rollback_releases_budget_for_reuse(db, ledger, policy):
    denied_intent = PaymentIntent(
        amount_ngn=Decimal("100"),
        recipient="someone_not_allowed",
        category="delivery",
        reason="test",
        idempotency_key="bad-recipient",
    )
    result = ledger.process_intent(db, denied_intent, policy)
    assert result.decision.verdict == Verdict.DENY

    # the rejected attempt must not have consumed any of the daily budget
    ok_result = ledger.process_intent(db, make_intent("good-one", "1000"), policy)
    assert ok_result.decision.verdict == Verdict.ALLOW


def test_float_ceiling_holds_under_concurrency_even_with_a_misconfigured_policy(engine, ledger_factory):
    """PRD non-negotiable #3: the float ceiling must hold independently of policy. Give the
    policy a daily cap far above the float limit and prove the float still caps total spend."""
    reckless_policy = PolicyConfig(
        version=1,
        daily_cap_ngn=Decimal("1000000"),  # deliberately far above the float limit below
        per_tx_cap_ngn=Decimal("1000000"),
        approval_threshold_ngn=Decimal("1000000"),
        allowed_categories=frozenset({"delivery"}),
        allowed_recipients=frozenset({"rider_1"}),
        velocity_limit_count=1000,
        velocity_window_seconds=3600,
    )
    tiny_float_ledger = ledger_factory(Decimal("500"))
    session_factory = sessionmaker(bind=engine)

    def submit(i):
        with session_factory() as db:
            return tiny_float_ledger.process_intent(db, make_intent(f"float-key-{i}", "100"), reckless_policy)

    with ThreadPoolExecutor(max_workers=20) as pool:
        results = list(pool.map(submit, range(20)))

    allowed = [r for r in results if r.decision.verdict == Verdict.ALLOW]
    assert len(allowed) == 5  # 500 float / 100 per intent — the daily cap of 1,000,000 never gets a say
    assert tiny_float_ledger.current_float_total() == Decimal("500")


def test_needs_approval_holds_the_reservation_instead_of_releasing_it(db, ledger):
    """Unlike DENY, a needs_approval verdict must NOT release its budget reservation
    immediately — a human hasn't ruled yet, and it might still be approved."""
    approval_policy = PolicyConfig(
        version=1,
        daily_cap_ngn=Decimal("2000"),
        per_tx_cap_ngn=Decimal("2000"),
        approval_threshold_ngn=Decimal("100"),  # low, so a 750 intent needs approval
        allowed_categories=frozenset({"delivery"}),
        allowed_recipients=frozenset({"rider_1"}),
        velocity_limit_count=1000,
        velocity_window_seconds=3600,
    )
    result = ledger.process_intent(db, make_intent("needs-approval-hold", "750"), approval_policy)

    assert result.decision.verdict == Verdict.NEEDS_APPROVAL
    assert current_daily_total(ledger) == Decimal("750")  # held, not released

    # simulating the eventual "denied" resolution releasing it
    ledger.rollback_reservation(make_intent("needs-approval-hold", "750"))
    assert current_daily_total(ledger) == Decimal("0")
