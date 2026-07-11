from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.domain import Verdict


class PolicyModel(Base):
    """One version of the policy. Rows are never updated in place — a change inserts a new version."""

    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(primary_key=True)
    version: Mapped[int] = mapped_column(unique=True, index=True)
    daily_cap_ngn: Mapped[float] = mapped_column(Numeric(14, 2))
    per_tx_cap_ngn: Mapped[float] = mapped_column(Numeric(14, 2))
    approval_threshold_ngn: Mapped[float] = mapped_column(Numeric(14, 2))
    allowed_categories: Mapped[list[str]] = mapped_column(JSON)
    allowed_recipients: Mapped[list[str]] = mapped_column(JSON)
    velocity_limit_count: Mapped[int]
    velocity_window_seconds: Mapped[int]
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class IntentModel(Base):
    __tablename__ = "intents"

    id: Mapped[int] = mapped_column(primary_key=True)
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    amount_ngn: Mapped[float] = mapped_column(Numeric(14, 2))
    recipient: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100))
    reason: Mapped[str] = mapped_column(String(500))
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    decision: Mapped["DecisionModel"] = relationship(back_populates="intent", uselist=False)


class DecisionModel(Base):
    __tablename__ = "decisions"
    __table_args__ = (UniqueConstraint("intent_id", name="uq_decision_intent"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    intent_id: Mapped[int] = mapped_column(ForeignKey("intents.id"))
    verdict: Mapped[Verdict] = mapped_column(String(20))
    reason: Mapped[str] = mapped_column(String(500))
    policy_version: Mapped[int]
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    intent: Mapped["IntentModel"] = relationship(back_populates="decision")
    transfer: Mapped["TransferModel | None"] = relationship(back_populates="decision", uselist=False)


class TransferModel(Base):
    __tablename__ = "transfers"
    __table_args__ = (UniqueConstraint("decision_id", name="uq_transfer_decision"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    decision_id: Mapped[int] = mapped_column(ForeignKey("decisions.id"))
    rail: Mapped[str] = mapped_column(String(50), default="paystack")
    rail_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50))
    amount_ngn: Mapped[float] = mapped_column(Numeric(14, 2))
    settled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    decision: Mapped["DecisionModel"] = relationship(back_populates="transfer")
