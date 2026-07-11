from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import DecisionModel, IntentModel, TransferModel
from app.schemas import AuditEntry

router = APIRouter(tags=["audit"])


@router.get("/audit", response_model=list[AuditEntry])
def read_audit_log(db: Session = Depends(get_db), limit: int = 100) -> list[AuditEntry]:
    rows = db.execute(
        select(IntentModel, DecisionModel, TransferModel)
        .join(DecisionModel, DecisionModel.intent_id == IntentModel.id)
        .outerjoin(TransferModel, TransferModel.decision_id == DecisionModel.id)
        .order_by(IntentModel.received_at.desc())
        .limit(limit)
    ).all()

    return [
        AuditEntry(
            intent_id=intent.id,
            idempotency_key=intent.idempotency_key,
            amount_ngn=intent.amount_ngn,
            recipient=intent.recipient,
            category=intent.category,
            reason=intent.reason,
            received_at=intent.received_at,
            verdict=decision.verdict,
            decision_reason=decision.reason,
            policy_version=decision.policy_version,
            evaluated_at=decision.evaluated_at,
            transfer_reference=transfer.rail_reference if transfer else None,
            transfer_status=transfer.status if transfer else None,
        )
        for intent, decision, transfer in rows
    ]
