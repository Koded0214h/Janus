from decimal import Decimal
from functools import lru_cache

from fastapi import Depends

from app.approvals.base import ApprovalChannel
from app.approvals.email_channel import EmailApprovalChannel
from app.approvals.service import ApprovalService
from app.approvals.telegram_channel import TelegramApprovalChannel
from app.config import Settings, get_settings
from app.db import SessionLocal, get_db
from app.executors.base import Executor
from app.executors.paystack import PaystackExecutor
from app.ledger import SpendLedger
from app.redis_client import get_redis

__all__ = ["get_db", "get_settings", "get_ledger", "get_executor", "get_approval_channel", "get_approval_service"]


@lru_cache
def _build_ledger(float_limit_ngn: int) -> SpendLedger:
    return SpendLedger(get_redis(), Decimal(float_limit_ngn))


def get_ledger(settings: Settings = Depends(get_settings)) -> SpendLedger:
    return _build_ledger(settings.float_limit_ngn)


@lru_cache
def _build_executor(settings: Settings) -> Executor:
    return PaystackExecutor(settings)


def get_executor(settings: Settings = Depends(get_settings)) -> Executor:
    return _build_executor(settings)


@lru_cache
def _build_approval_channel(settings: Settings) -> ApprovalChannel:
    if settings.approval_channel == "telegram":
        return TelegramApprovalChannel(settings)
    return EmailApprovalChannel(settings)


def get_approval_channel(settings: Settings = Depends(get_settings)) -> ApprovalChannel:
    return _build_approval_channel(settings)


@lru_cache
def _build_approval_service(
    settings: Settings,
    channel: ApprovalChannel,
) -> ApprovalService:
    return ApprovalService(
        channel=channel,
        session_factory=SessionLocal,
        base_url=settings.base_url,
        timeout_seconds=settings.approval_timeout_seconds,
        max_pending_waiters=settings.approval_max_pending_waiters,
    )


def get_approval_service(
    settings: Settings = Depends(get_settings),
    channel: ApprovalChannel = Depends(get_approval_channel),
) -> ApprovalService:
    return _build_approval_service(settings, channel)
