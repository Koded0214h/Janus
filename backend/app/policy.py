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
    model = _active_model(db)
    if model is None:
        model = create_new_version(db, DEFAULT_POLICY)
    return to_domain(model)


def create_new_version(db: Session, new_policy: PolicyConfig) -> PolicyModel:
    """Inserts a new policy version and deactivates whatever was active before. Rows are
    never updated in place — this is the only way policy is ever allowed to change."""
    current = _active_model(db)
    next_version = (current.version + 1) if current is not None else 1
    if current is not None:
        current.is_active = False

    model = PolicyModel(
        version=next_version,
        daily_cap_ngn=new_policy.daily_cap_ngn,
        per_tx_cap_ngn=new_policy.per_tx_cap_ngn,
        approval_threshold_ngn=new_policy.approval_threshold_ngn,
        allowed_categories=sorted(new_policy.allowed_categories),
        allowed_recipients=sorted(new_policy.allowed_recipients),
        velocity_limit_count=new_policy.velocity_limit_count,
        velocity_window_seconds=new_policy.velocity_window_seconds,
        is_active=True,
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


def _active_model(db: Session) -> PolicyModel | None:
    return db.scalar(select(PolicyModel).where(PolicyModel.is_active.is_(True)).order_by(PolicyModel.version.desc()))
