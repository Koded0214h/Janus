from decimal import Decimal

import pytest

from app.decision_engine import evaluate
from app.domain import PaymentIntent, PolicyConfig, SpendState, Verdict

POLICY = PolicyConfig(
    version=1,
    daily_cap_ngn=Decimal("2000"),
    per_tx_cap_ngn=Decimal("1000"),
    approval_threshold_ngn=Decimal("500"),
    allowed_categories=frozenset({"delivery", "vendor_payout"}),
    allowed_recipients=frozenset({"rider_1", "vendor_acme"}),
    velocity_limit_count=3,
    velocity_window_seconds=3600,
)

ZERO_SPEND = SpendState(daily_total_ngn=Decimal("0"), velocity_count=0)


def intent(**overrides) -> PaymentIntent:
    defaults = dict(
        amount_ngn=Decimal("150"),
        recipient="rider_1",
        category="delivery",
        reason="delivery fee",
        idempotency_key="key-1",
    )
    defaults.update(overrides)
    return PaymentIntent(**defaults)


def test_allows_small_known_payment():
    decision = evaluate(intent(), POLICY, ZERO_SPEND)
    assert decision.verdict == Verdict.ALLOW
    assert decision.policy_version == POLICY.version


def test_denies_unknown_category():
    decision = evaluate(intent(category="crypto"), POLICY, ZERO_SPEND)
    assert decision.verdict == Verdict.DENY
    assert "category" in decision.reason


def test_denies_unlisted_recipient():
    decision = evaluate(intent(recipient="stranger"), POLICY, ZERO_SPEND)
    assert decision.verdict == Verdict.DENY
    assert "recipient" in decision.reason


def test_denies_over_per_tx_cap():
    decision = evaluate(intent(amount_ngn=Decimal("1500")), POLICY, ZERO_SPEND)
    assert decision.verdict == Verdict.DENY
    assert "per-transaction cap" in decision.reason


def test_denies_over_daily_cap_even_if_under_per_tx_cap():
    spend = SpendState(daily_total_ngn=Decimal("1900"), velocity_count=0)
    decision = evaluate(intent(amount_ngn=Decimal("150")), POLICY, spend)
    assert decision.verdict == Verdict.DENY
    assert "daily total" in decision.reason


def test_denies_at_velocity_limit():
    spend = SpendState(daily_total_ngn=Decimal("0"), velocity_count=3)
    decision = evaluate(intent(), POLICY, spend)
    assert decision.verdict == Verdict.DENY
    assert "velocity" in decision.reason


def test_needs_approval_above_threshold_below_cap():
    decision = evaluate(intent(amount_ngn=Decimal("750")), POLICY, ZERO_SPEND)
    assert decision.verdict == Verdict.NEEDS_APPROVAL
    assert "approval threshold" in decision.reason


def test_allows_amount_exactly_at_threshold():
    decision = evaluate(intent(amount_ngn=Decimal("500")), POLICY, ZERO_SPEND)
    assert decision.verdict == Verdict.ALLOW


def test_allows_amount_exactly_at_daily_cap():
    spend = SpendState(daily_total_ngn=Decimal("1850"), velocity_count=0)
    decision = evaluate(intent(amount_ngn=Decimal("150")), POLICY, spend)
    assert decision.verdict == Verdict.ALLOW


@pytest.mark.parametrize(
    "amount,category,recipient",
    [
        (Decimal("1500"), "delivery", "rider_1"),  # over per-tx cap wins over category/recipient being fine
        (Decimal("50"), "crypto", "stranger"),  # category checked before recipient
    ],
)
def test_deny_precedence_is_deterministic(amount, category, recipient):
    d1 = evaluate(intent(amount_ngn=amount, category=category, recipient=recipient), POLICY, ZERO_SPEND)
    d2 = evaluate(intent(amount_ngn=amount, category=category, recipient=recipient), POLICY, ZERO_SPEND)
    assert d1.verdict == d2.verdict == Verdict.DENY
    assert d1.reason == d2.reason
