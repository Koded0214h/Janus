from fastapi import Depends

from app.config import Settings, get_settings
from app.db import get_db
from app.executors.base import Executor
from app.executors.paystack import PaystackExecutor
from app.ledger import SpendLedger
from app.redis_client import get_redis

__all__ = ["get_db", "get_settings", "get_ledger", "get_executor"]


def get_ledger() -> SpendLedger:
    return SpendLedger(get_redis())


def get_executor(settings: Settings = Depends(get_settings)) -> Executor:
    return PaystackExecutor(settings)
