from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.approvals.service import ApprovalCapacityExceededError, ApprovalService
from app.auth import require_api_key
from app.decision_engine import Verdict
from app.deps import get_approval_service, get_db, get_executor, get_ledger
from app.domain import ApprovalOutcome, Decision, PaymentIntent
from app.executors.base import Executor
from app.ledger import SpendLedger
from app.models import ApprovalModel, TransferModel
from app.policy import get_active_policy
from app.schemas import DecisionResponse, IntentRequest, Receipt, Status, status_for

router = APIRouter(tags=["intents"], dependencies=[Depends(require_api_key)])


@router.post("/intents", response_model=DecisionResponse)
def submit_intent(
    request: IntentRequest,
    db: Session = Depends(get_db),
    ledger: SpendLedger = Depends(get_ledger),
    executor: Executor = Depends(get_executor),
    approval_service: ApprovalService = Depends(get_approval_service),
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
    decision_id = result.decision_model.id

    if result.is_replay:
        receipt = _existing_receipt(db, decision_id)
        approval = _existing_approval(db, decision_id)
        status, reason = _final_status_and_reason(result.decision, approval)
    elif result.decision.verdict == Verdict.ALLOW:
        receipt = _execute_and_record(db, ledger, executor, intent, decision_id)
        status, reason = "allowed", result.decision.reason
    elif result.decision.verdict == Verdict.DENY:
        receipt = None
        status, reason = "denied", result.decision.reason
    else:
        try:
            outcome = approval_service.request_and_wait(db, result.decision_model, intent)
        except ApprovalCapacityExceededError as exc:
            ledger.rollback_reservation(intent)
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        db.expire_all()  # the wait ran on separate sessions — force a fresh read of our rows

        if outcome == ApprovalOutcome.APPROVED:
            receipt = _execute_and_record(db, ledger, executor, intent, decision_id)
            status, reason = "allowed", "approved by human reviewer"
        else:
            ledger.rollback_reservation(intent)
            receipt = None
            status = "denied"
            reason = (
                "approval timed out, defaulted to deny"
                if outcome == ApprovalOutcome.EXPIRED
                else "denied by human reviewer"
            )

    return DecisionResponse(
        id=f"dec_{decision_id}",
        status=status,
        reason=reason,
        policy_version=result.decision.policy_version,
        evaluated_at=result.decision.evaluated_at,
        is_replay=result.is_replay,
        remaining_daily_ngn=policy.daily_cap_ngn - ledger.current_daily_total(),
        receipt=receipt,
    )


def _execute_and_record(
    db: Session, ledger: SpendLedger, executor: Executor, intent: PaymentIntent, decision_id: int
) -> Receipt:
    transfer_result = executor.execute(intent)

    if not transfer_result.success:
        ledger.rollback_reservation(intent)

    transfer_model = TransferModel(
        decision_id=decision_id,
        rail=transfer_result.rail,
        rail_reference=transfer_result.reference,
        status=transfer_result.status,
        amount_ngn=intent.amount_ngn,
    )
    db.add(transfer_model)
    db.commit()

    return Receipt(
        rail=transfer_result.rail,
        rail_reference=transfer_result.reference,
        amount_ngn=intent.amount_ngn,
        status=transfer_result.status,
    )


def _existing_receipt(db: Session, decision_id: int) -> Receipt | None:
    transfer = db.query(TransferModel).filter_by(decision_id=decision_id).one_or_none()
    if transfer is None:
        return None
    return Receipt(
        rail=transfer.rail,
        rail_reference=transfer.rail_reference,
        amount_ngn=transfer.amount_ngn,
        status=transfer.status,
    )


def _existing_approval(db: Session, decision_id: int) -> ApprovalModel | None:
    return db.query(ApprovalModel).filter_by(decision_id=decision_id).one_or_none()


def _final_status_and_reason(decision: Decision, approval: ApprovalModel | None) -> tuple[Status, str]:
    if decision.verdict != Verdict.NEEDS_APPROVAL:
        return status_for(decision.verdict), decision.reason

    if approval is None or approval.status == ApprovalOutcome.PENDING:
        return "needs_approval", decision.reason
    if approval.status == ApprovalOutcome.APPROVED:
        return "allowed", "approved by human reviewer"
    if approval.status == ApprovalOutcome.EXPIRED:
        return "denied", "approval timed out, defaulted to deny"
    return "denied", "denied by human reviewer"
