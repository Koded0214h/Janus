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

# Large enough to never bind in tests that aren't specifically exercising the float ceiling.
FLOAT_LIMIT = Decimal("1000000")

ZERO_SPEND = SpendState(daily_total_ngn=Decimal("0"), velocity_count=0, float_total_ngn=Decimal("0"))


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
    decision = evaluate(intent(), POLICY, ZERO_SPEND, FLOAT_LIMIT)
    assert decision.verdict == Verdict.ALLOW
    assert decision.policy_version == POLICY.version


def test_denies_unknown_category():
    decision = evaluate(intent(category="crypto"), POLICY, ZERO_SPEND, FLOAT_LIMIT)
    assert decision.verdict == Verdict.DENY
    assert "category" in decision.reason


def test_denies_unlisted_recipient():
    decision = evaluate(intent(recipient="stranger"), POLICY, ZERO_SPEND, FLOAT_LIMIT)
    assert decision.verdict == Verdict.DENY
    assert "recipient" in decision.reason


def test_denies_over_per_tx_cap():
    decision = evaluate(intent(amount_ngn=Decimal("1500")), POLICY, ZERO_SPEND, FLOAT_LIMIT)
    assert decision.verdict == Verdict.DENY
    assert "per-transaction cap" in decision.reason


def test_denies_over_daily_cap_even_if_under_per_tx_cap():
    spend = SpendState(daily_total_ngn=Decimal("1900"), velocity_count=0, float_total_ngn=Decimal("1900"))
    decision = evaluate(intent(amount_ngn=Decimal("150")), POLICY, spend, FLOAT_LIMIT)
    assert decision.verdict == Verdict.DENY
    assert "daily total" in decision.reason


def test_denies_at_velocity_limit():
    spend = SpendState(daily_total_ngn=Decimal("0"), velocity_count=3, float_total_ngn=Decimal("0"))
    decision = evaluate(intent(), POLICY, spend, FLOAT_LIMIT)
    assert decision.verdict == Verdict.DENY
    assert "velocity" in decision.reason


def test_needs_approval_above_threshold_below_cap():
    decision = evaluate(intent(amount_ngn=Decimal("750")), POLICY, ZERO_SPEND, FLOAT_LIMIT)
    assert decision.verdict == Verdict.NEEDS_APPROVAL
    assert "approval threshold" in decision.reason


def test_allows_amount_exactly_at_threshold():
    decision = evaluate(intent(amount_ngn=Decimal("500")), POLICY, ZERO_SPEND, FLOAT_LIMIT)
    assert decision.verdict == Verdict.ALLOW


def test_allows_amount_exactly_at_daily_cap():
    spend = SpendState(daily_total_ngn=Decimal("1850"), velocity_count=0, float_total_ngn=Decimal("1850"))
    decision = evaluate(intent(amount_ngn=Decimal("150")), POLICY, spend, FLOAT_LIMIT)
    assert decision.verdict == Verdict.ALLOW


@pytest.mark.parametrize(
    "amount,category,recipient",
    [
        (Decimal("1500"), "delivery", "rider_1"),  # over per-tx cap wins over category/recipient being fine
        (Decimal("50"), "crypto", "stranger"),  # category checked before recipient
    ],
)
def test_deny_precedence_is_deterministic(amount, category, recipient):
    d1 = evaluate(intent(amount_ngn=amount, category=category, recipient=recipient), POLICY, ZERO_SPEND, FLOAT_LIMIT)
    d2 = evaluate(intent(amount_ngn=amount, category=category, recipient=recipient), POLICY, ZERO_SPEND, FLOAT_LIMIT)
    assert d1.verdict == d2.verdict == Verdict.DENY
    assert d1.reason == d2.reason


# --- Float ceiling: PRD non-negotiable #3, must hold even when the policy is generous. ---

GENEROUS_POLICY = PolicyConfig(
    version=1,
    daily_cap_ngn=Decimal("1000000"),  # deliberately huge / "misconfigured"
    per_tx_cap_ngn=Decimal("1000000"),
    approval_threshold_ngn=Decimal("1000000"),
    allowed_categories=frozenset({"delivery"}),
    allowed_recipients=frozenset({"rider_1"}),
    velocity_limit_count=1000,
    velocity_window_seconds=3600,
)


def test_denies_over_float_ceiling_even_with_generous_policy():
    tiny_float_limit = Decimal("2000")
    spend = SpendState(daily_total_ngn=Decimal("0"), velocity_count=0, float_total_ngn=Decimal("1950"))
    decision = evaluate(intent(amount_ngn=Decimal("100")), GENEROUS_POLICY, spend, tiny_float_limit)
    assert decision.verdict == Verdict.DENY
    assert "float ceiling" in decision.reason


def test_allows_up_to_exactly_the_float_ceiling():
    tiny_float_limit = Decimal("2000")
    spend = SpendState(daily_total_ngn=Decimal("0"), velocity_count=0, float_total_ngn=Decimal("1900"))
    decision = evaluate(intent(amount_ngn=Decimal("100")), GENEROUS_POLICY, spend, tiny_float_limit)
    assert decision.verdict == Verdict.ALLOW


def test_float_ceiling_is_checked_before_daily_cap():
    """A policy daily cap far above the float limit must not matter — float wins."""
    tiny_float_limit = Decimal("500")
    spend = SpendState(daily_total_ngn=Decimal("0"), velocity_count=0, float_total_ngn=Decimal("500"))
    decision = evaluate(intent(amount_ngn=Decimal("1")), GENEROUS_POLICY, spend, tiny_float_limit)
    assert decision.verdict == Verdict.DENY
    assert "float ceiling" in decision.reason
