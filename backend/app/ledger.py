"""The spend ledger: atomic budget reservation (Redis) + the durable, append-only record (Postgres).

The core correctness property this file exists to guarantee: under concurrent requests,
the daily cap and velocity limit can never be exceeded, and the same idempotency_key can
never be charged twice. Both are enforced with atomicity primitives, not application-level
locking — a Lua script for the Redis reservation, a unique constraint for Postgres replay.
"""

from dataclasses import dataclass
from datetime import UTC, date, datetime
from decimal import Decimal

import redis
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.decision_engine import evaluate
from app.domain import Decision, PaymentIntent, PolicyConfig, SpendState, Verdict
from app.models import DecisionModel, IntentModel

_RESERVE_SCRIPT = """
local daily_key = KEYS[1]
local velocity_key = KEYS[2]
local amount = tonumber(ARGV[1])
local daily_cap = tonumber(ARGV[2])
local velocity_limit = tonumber(ARGV[3])
local window_seconds = tonumber(ARGV[4])
local now_ms = tonumber(ARGV[5])
local member = ARGV[6]
local daily_ttl = tonumber(ARGV[7])

redis.call('ZREMRANGEBYSCORE', velocity_key, '-inf', now_ms - (window_seconds * 1000))

local daily_total = tonumber(redis.call('GET', daily_key) or "0")
local velocity_count = redis.call('ZCARD', velocity_key)

local exceeds_daily = (daily_total + amount) > daily_cap
local exceeds_velocity = velocity_count >= velocity_limit

if exceeds_daily or exceeds_velocity then
  return {tostring(daily_total), tostring(velocity_count), 0}
end

redis.call('INCRBYFLOAT', daily_key, amount)
redis.call('EXPIRE', daily_key, daily_ttl)
redis.call('ZADD', velocity_key, now_ms, member)
redis.call('EXPIRE', velocity_key, window_seconds + 60)

return {tostring(daily_total), tostring(velocity_count), 1}
"""

_ROLLBACK_SCRIPT = """
local daily_key = KEYS[1]
local velocity_key = KEYS[2]
local amount = tonumber(ARGV[1])
local member = ARGV[2]

redis.call('INCRBYFLOAT', daily_key, -amount)
redis.call('ZREM', velocity_key, member)
return redis.status_reply('OK')
"""


@dataclass
class ProcessResult:
    decision: Decision
    intent_model: IntentModel
    decision_model: DecisionModel
    is_replay: bool
    """True if idempotency_key was already seen — decision is the stored one, nothing new happened."""


class SpendLedger:
    def __init__(self, redis_client: redis.Redis):
        self._redis = redis_client
        self._reserve = redis_client.register_script(_RESERVE_SCRIPT)
        self._rollback = redis_client.register_script(_ROLLBACK_SCRIPT)

    @staticmethod
    def _daily_key(today: date) -> str:
        return f"janus:spend:daily:{today.isoformat()}"

    @staticmethod
    def _velocity_key() -> str:
        return "janus:spend:velocity"

    def _reserve_budget(self, intent: PaymentIntent, policy: PolicyConfig) -> tuple[SpendState, bool]:
        """Atomically reserves daily-cap + velocity budget iff both currently allow it.

        Returns the spend snapshot *before* this reservation (what the decision engine
        should evaluate against) and whether the reservation was granted.
        """
        now_ms = datetime.now(UTC).timestamp() * 1000
        daily_total_str, velocity_count_str, reserved = self._reserve(
            keys=[self._daily_key(datetime.now(UTC).date()), self._velocity_key()],
            args=[
                str(intent.amount_ngn),
                str(policy.daily_cap_ngn),
                policy.velocity_limit_count,
                policy.velocity_window_seconds,
                now_ms,
                intent.idempotency_key,
                60 * 60 * 25,  # daily key TTL: a bit over a day, so it self-expires
            ],
        )
        spend_state = SpendState(
            daily_total_ngn=Decimal(daily_total_str),
            velocity_count=int(velocity_count_str),
        )
        return spend_state, bool(reserved)

    def rollback_reservation(self, intent: PaymentIntent) -> None:
        """Public on purpose: also used when a decision was ALLOW and budget was reserved,
        but the executor then failed to actually move the money (e.g. Paystack rejected it) —
        the reservation must be released so the failed attempt doesn't count against the cap."""
        self._rollback(
            keys=[self._daily_key(datetime.now(UTC).date()), self._velocity_key()],
            args=[str(intent.amount_ngn), intent.idempotency_key],
        )

    def process_intent(self, db: Session, intent: PaymentIntent, policy: PolicyConfig) -> ProcessResult:
        existing = _find_existing(db, intent.idempotency_key)
        if existing is not None:
            intent_model, decision_model = existing
            return ProcessResult(
                decision=_decision_from_model(decision_model),
                intent_model=intent_model,
                decision_model=decision_model,
                is_replay=True,
            )

        spend_state, reserved = self._reserve_budget(intent, policy)
        decision = evaluate(intent, policy, spend_state)

        if decision.verdict != Verdict.ALLOW and reserved:
            self.rollback_reservation(intent)

        try:
            intent_model = IntentModel(
                idempotency_key=intent.idempotency_key,
                amount_ngn=intent.amount_ngn,
                recipient=intent.recipient,
                category=intent.category,
                reason=intent.reason,
            )
            db.add(intent_model)
            db.flush()

            decision_model = DecisionModel(
                intent_id=intent_model.id,
                verdict=decision.verdict,
                reason=decision.reason,
                policy_version=decision.policy_version,
            )
            db.add(decision_model)
            db.commit()
            db.refresh(intent_model)
            db.refresh(decision_model)
        except IntegrityError:
            db.rollback()
            if decision.verdict == Verdict.ALLOW and reserved:
                self.rollback_reservation(intent)
            existing = _find_existing(db, intent.idempotency_key)
            if existing is None:
                raise
            intent_model, decision_model = existing
            return ProcessResult(
                decision=_decision_from_model(decision_model),
                intent_model=intent_model,
                decision_model=decision_model,
                is_replay=True,
            )

        return ProcessResult(
            decision=_decision_from_model(decision_model),
            intent_model=intent_model,
            decision_model=decision_model,
            is_replay=False,
        )


def _find_existing(db: Session, idempotency_key: str) -> tuple[IntentModel, DecisionModel] | None:
    intent_model = db.query(IntentModel).filter_by(idempotency_key=idempotency_key).one_or_none()
    if intent_model is None:
        return None
    decision_model = db.query(DecisionModel).filter_by(intent_id=intent_model.id).one_or_none()
    if decision_model is None:
        return None
    return intent_model, decision_model


def _decision_from_model(model: DecisionModel) -> Decision:
    return Decision(
        verdict=Verdict(model.verdict),
        reason=model.reason,
        policy_version=model.policy_version,
        evaluated_at=model.evaluated_at,
    )
