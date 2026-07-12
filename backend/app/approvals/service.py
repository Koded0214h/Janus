"""Orchestrates the human-in-the-loop approval wait: create the approval record, notify the
channel, then block (poll) until a human resolves it or it times out to deny.

The polling loop deliberately opens a fresh DB session per check instead of reusing the
request's session — a `needs_approval` wait can run for minutes, and holding one connection
idle-in-transaction for that whole span is worth avoiding even at MVP scale.
"""

import secrets
import time
from datetime import UTC, datetime, timedelta

from sqlalchemy import update
from sqlalchemy.orm import Session, sessionmaker

from app.approvals.base import ApprovalChannel, ApprovalRequest
from app.domain import ApprovalOutcome, PaymentIntent
from app.models import ApprovalModel, DecisionModel

DEFAULT_POLL_INTERVAL_SECONDS = 1.0


class ApprovalService:
    def __init__(
        self,
        channel: ApprovalChannel,
        session_factory: sessionmaker[Session],
        base_url: str,
        timeout_seconds: int,
        poll_interval_seconds: float = DEFAULT_POLL_INTERVAL_SECONDS,
    ):
        self._channel = channel
        self._session_factory = session_factory
        self._base_url = base_url.rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._poll_interval_seconds = poll_interval_seconds

    def request_and_wait(self, db: Session, decision_model: DecisionModel, intent: PaymentIntent) -> ApprovalOutcome:
        token = secrets.token_urlsafe(24)
        expires_at = datetime.now(UTC) + timedelta(seconds=self._timeout_seconds)

        approval = ApprovalModel(
            decision_id=decision_model.id,
            token=token,
            status=ApprovalOutcome.PENDING,
            channel=self._channel.name,
            expires_at=expires_at,
        )
        db.add(approval)
        db.commit()
        db.refresh(approval)

        request = ApprovalRequest(
            token=token,
            intent=intent,
            decision_reason=decision_model.reason,
            review_url=f"{self._base_url}/approvals/{token}",
            expires_at=expires_at,
        )
        self._channel.notify(request)

        return self._wait_for_resolution(approval.id, expires_at)

    def _wait_for_resolution(self, approval_id: int, expires_at: datetime) -> ApprovalOutcome:
        while datetime.now(UTC) < expires_at:
            with self._session_factory() as poll_db:
                approval = poll_db.get(ApprovalModel, approval_id)
                if approval.status != ApprovalOutcome.PENDING:
                    return ApprovalOutcome(approval.status)
            time.sleep(self._poll_interval_seconds)

        return _expire_if_still_pending(self._session_factory, approval_id)


def _expire_if_still_pending(session_factory: sessionmaker[Session], approval_id: int) -> ApprovalOutcome:
    with session_factory() as db:
        approval = db.get(ApprovalModel, approval_id)
        if approval.status == ApprovalOutcome.PENDING:
            approval.status = ApprovalOutcome.EXPIRED
            approval.resolved_at = datetime.now(UTC)
            db.commit()
            return ApprovalOutcome.EXPIRED
        return ApprovalOutcome(approval.status)


def resolve(db: Session, token: str, outcome: ApprovalOutcome) -> ApprovalModel | None:
    """Race-safe: only transitions a row that is still PENDING and not yet expired. Always
    returns the row's current state afterward — the caller checks `.status` to tell whether
    this call actually won the resolution or the row was already settled."""
    now = datetime.now(UTC)
    db.execute(
        update(ApprovalModel)
        .where(
            ApprovalModel.token == token,
            ApprovalModel.status == ApprovalOutcome.PENDING,
            ApprovalModel.expires_at > now,
        )
        .values(status=outcome, resolved_at=now)
    )
    db.commit()
    return db.query(ApprovalModel).filter_by(token=token).one_or_none()
