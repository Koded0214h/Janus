"""Loading and seeding the active policy."""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain import PolicyConfig
from app.models import PolicyModel

DEFAULT_POLICY = PolicyConfig(
    version=1,
    daily_cap_ngn=Decimal("2000"),
    per_tx_cap_ngn=Decimal("1000"),
    approval_threshold_ngn=Decimal("500"),
    allowed_categories=frozenset({"delivery", "airtime", "data", "vendor_payout"}),
    allowed_recipients=frozenset(),  # empty on purpose — nothing is trusted until you allowlist it
    velocity_limit_count=10,
    velocity_window_seconds=3600,
)


def to_domain(model: PolicyModel) -> PolicyConfig:
    return PolicyConfig(
        version=model.version,
        daily_cap_ngn=Decimal(str(model.daily_cap_ngn)),
        per_tx_cap_ngn=Decimal(str(model.per_tx_cap_ngn)),
        approval_threshold_ngn=Decimal(str(model.approval_threshold_ngn)),
        allowed_categories=frozenset(model.allowed_categories),
        allowed_recipients=frozenset(model.allowed_recipients),
        velocity_limit_count=model.velocity_limit_count,
        velocity_window_seconds=model.velocity_window_seconds,
    )


def get_active_policy(db: Session) -> PolicyConfig:
    model = db.scalar(select(PolicyModel).where(PolicyModel.is_active.is_(True)).order_by(PolicyModel.version.desc()))
    if model is None:
        model = seed_default_policy(db)
    return to_domain(model)


def seed_default_policy(db: Session) -> PolicyModel:
    policy = DEFAULT_POLICY
    model = PolicyModel(
        version=policy.version,
        daily_cap_ngn=policy.daily_cap_ngn,
        per_tx_cap_ngn=policy.per_tx_cap_ngn,
        approval_threshold_ngn=policy.approval_threshold_ngn,
        allowed_categories=sorted(policy.allowed_categories),
        allowed_recipients=sorted(policy.allowed_recipients),
        velocity_limit_count=policy.velocity_limit_count,
        velocity_window_seconds=policy.velocity_window_seconds,
        is_active=True,
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return model
