"""The gate. A pure function: (intent, policy, spend_state) -> Decision.

No database, no network, no clock reads beyond what's passed in. This is deliberate —
every branch here must be provable with a unit test and nothing else.
"""

from app.domain import Decision, PaymentIntent, PolicyConfig, SpendState, Verdict


def evaluate(intent: PaymentIntent, policy: PolicyConfig, spend: SpendState) -> Decision:
    if intent.category not in policy.allowed_categories:
        return _deny(policy, f"category '{intent.category}' is not on the allowed list")

    if intent.recipient not in policy.allowed_recipients:
        return _deny(policy, f"recipient '{intent.recipient}' is not allow-listed")

    if intent.amount_ngn > policy.per_tx_cap_ngn:
        return _deny(
            policy,
            f"amount {intent.amount_ngn} exceeds per-transaction cap {policy.per_tx_cap_ngn}",
        )

    if spend.daily_total_ngn + intent.amount_ngn > policy.daily_cap_ngn:
        return _deny(
            policy,
            f"amount {intent.amount_ngn} would push daily total past cap {policy.daily_cap_ngn}",
        )

    if spend.velocity_count >= policy.velocity_limit_count:
        return _deny(
            policy,
            f"velocity limit reached ({policy.velocity_limit_count} payments per "
            f"{policy.velocity_window_seconds}s)",
        )

    if intent.amount_ngn > policy.approval_threshold_ngn:
        return Decision(
            verdict=Verdict.NEEDS_APPROVAL,
            reason=(
                f"amount {intent.amount_ngn} exceeds approval threshold "
                f"{policy.approval_threshold_ngn}, human sign-off required"
            ),
            policy_version=policy.version,
        )

    return Decision(
        verdict=Verdict.ALLOW,
        reason="within budget, category, recipient, and velocity limits",
        policy_version=policy.version,
    )


def _deny(policy: PolicyConfig, reason: str) -> Decision:
    return Decision(verdict=Verdict.DENY, reason=reason, policy_version=policy.version)
