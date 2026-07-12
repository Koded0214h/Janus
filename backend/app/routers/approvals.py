from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.approvals.service import resolve
from app.deps import get_db
from app.domain import ApprovalOutcome
from app.models import ApprovalModel, DecisionModel, IntentModel

router = APIRouter(tags=["approvals"])


@router.get("/approvals/{token}", response_class=HTMLResponse)
def review_approval(token: str, db: Session = Depends(get_db)) -> HTMLResponse:
    """Deliberately a GET, non-mutating page — the email links here, not straight to
    approve/deny, so mail-client link prefetching can't silently resolve a request."""
    approval = db.query(ApprovalModel).filter_by(token=token).one_or_none()
    if approval is None:
        return HTMLResponse(_page("Not found", "<p>No approval request matches this link.</p>"), status_code=404)

    if approval.status != ApprovalOutcome.PENDING:
        return HTMLResponse(_page("Already resolved", f"<p>This request was already <strong>{approval.status}</strong>.</p>"))

    decision = db.get(DecisionModel, approval.decision_id)
    intent = db.get(IntentModel, decision.intent_id)

    body = f"""
    <p><strong>NGN {intent.amount_ngn}</strong> to <strong>{intent.recipient}</strong> ({intent.category})</p>
    <p>Reason: {intent.reason}</p>
    <p>Why it needs approval: {decision.reason}</p>
    <p>Expires: {approval.expires_at.isoformat()}</p>
    <form method="post" action="/approvals/{token}/approve" style="display:inline">
      <button type="submit">Approve</button>
    </form>
    <form method="post" action="/approvals/{token}/deny" style="display:inline">
      <button type="submit">Deny</button>
    </form>
    """
    return HTMLResponse(_page("Janus approval request", body))


@router.post("/approvals/{token}/approve", response_class=HTMLResponse)
def approve(token: str, db: Session = Depends(get_db)) -> HTMLResponse:
    return _resolve_and_render(db, token, ApprovalOutcome.APPROVED)


@router.post("/approvals/{token}/deny", response_class=HTMLResponse)
def deny(token: str, db: Session = Depends(get_db)) -> HTMLResponse:
    return _resolve_and_render(db, token, ApprovalOutcome.DENIED)


def _resolve_and_render(db: Session, token: str, outcome: ApprovalOutcome) -> HTMLResponse:
    approval = resolve(db, token, outcome)
    if approval is None:
        return HTMLResponse(_page("Not found", "<p>No approval request matches this link.</p>"), status_code=404)
    return HTMLResponse(_page("Recorded", f"<p>This request is now <strong>{approval.status}</strong>.</p>"))


def _page(title: str, body: str) -> str:
    return f"<!doctype html><html><head><title>{title}</title></head><body><h1>{title}</h1>{body}</body></html>"
