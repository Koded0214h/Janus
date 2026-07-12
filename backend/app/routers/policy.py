from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.deps import get_db
from app.domain import PolicyConfig
from app.policy import create_new_version, get_active_policy, to_domain
from app.schemas import PolicyRequest, PolicyResponse

router = APIRouter(tags=["policy"], dependencies=[Depends(require_api_key)])


@router.get("/policy", response_model=PolicyResponse)
def read_active_policy(db: Session = Depends(get_db)) -> PolicyResponse:
    return _to_response(get_active_policy(db))


@router.post("/policy", response_model=PolicyResponse)
def update_policy(request: PolicyRequest, db: Session = Depends(get_db)) -> PolicyResponse:
    """Creates a new policy version and deactivates the previous one — never an in-place
    update. The new version applies to every request from this point forward; nothing
    retroactively changes what past decisions were evaluated against."""
    new_policy = PolicyConfig(
        version=0,  # assigned by create_new_version
        daily_cap_ngn=request.daily_cap_ngn,
        per_tx_cap_ngn=request.per_tx_cap_ngn,
        approval_threshold_ngn=request.approval_threshold_ngn,
        allowed_categories=frozenset(request.allowed_categories),
        allowed_recipients=frozenset(request.allowed_recipients),
        velocity_limit_count=request.velocity_limit_count,
        velocity_window_seconds=request.velocity_window_seconds,
    )
    model = create_new_version(db, new_policy)
    return _to_response(to_domain(model))


def _to_response(policy: PolicyConfig) -> PolicyResponse:
    return PolicyResponse(
        version=policy.version,
        daily_cap_ngn=policy.daily_cap_ngn,
        per_tx_cap_ngn=policy.per_tx_cap_ngn,
        approval_threshold_ngn=policy.approval_threshold_ngn,
        allowed_categories=sorted(policy.allowed_categories),
        allowed_recipients=sorted(policy.allowed_recipients),
        velocity_limit_count=policy.velocity_limit_count,
        velocity_window_seconds=policy.velocity_window_seconds,
    )
