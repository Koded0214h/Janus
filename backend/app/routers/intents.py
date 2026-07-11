from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.decision_engine import Verdict
from app.deps import get_db, get_executor, get_ledger
from app.domain import PaymentIntent
from app.executors.base import Executor
from app.ledger import SpendLedger
from app.models import TransferModel
from app.policy import get_active_policy
from app.schemas import DecisionResponse, IntentRequest, TransferInfo

router = APIRouter(tags=["intents"])


@router.post("/intents", response_model=DecisionResponse)
def submit_intent(
    request: IntentRequest,
    db: Session = Depends(get_db),
    ledger: SpendLedger = Depends(get_ledger),
    executor: Executor = Depends(get_executor),
) -> DecisionResponse:
    intent = PaymentIntent(
        amount_ngn=request.amount_ngn,
        recipient=request.recipient,
        category=request.category,
        reason=request.reason,
        idempotency_key=request.idempotency_key,
    )
    policy = get_active_policy(db)
    result = ledger.process_intent(db, intent, policy)

    transfer_info: TransferInfo | None = None

    if result.is_replay:
        existing_transfer = db.query(TransferModel).filter_by(decision_id=result.decision_model.id).one_or_none()
        if existing_transfer is not None:
            transfer_info = TransferInfo(reference=existing_transfer.rail_reference, status=existing_transfer.status)
    elif result.decision.verdict == Verdict.ALLOW:
        transfer_result = executor.execute(intent)

        if not transfer_result.success:
            ledger.rollback_reservation(intent)

        transfer_model = TransferModel(
            decision_id=result.decision_model.id,
            rail=transfer_result.rail,
            rail_reference=transfer_result.reference,
            status=transfer_result.status,
            amount_ngn=intent.amount_ngn,
        )
        db.add(transfer_model)
        db.commit()

        transfer_info = TransferInfo(reference=transfer_result.reference, status=transfer_result.status)

    return DecisionResponse(
        verdict=result.decision.verdict,
        reason=result.decision.reason,
        policy_version=result.decision.policy_version,
        evaluated_at=result.decision.evaluated_at,
        is_replay=result.is_replay,
        transfer=transfer_info,
    )
