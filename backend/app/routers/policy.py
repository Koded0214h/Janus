from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db
from app.policy import get_active_policy
from app.schemas import PolicyResponse

router = APIRouter(tags=["policy"])


@router.get("/policy", response_model=PolicyResponse)
def read_active_policy(db: Session = Depends(get_db)) -> PolicyResponse:
    policy = get_active_policy(db)
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
