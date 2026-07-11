from collections.abc import Generator
from decimal import Decimal

import pytest
import redis
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings
from app.db import Base
from app.domain import PolicyConfig
from app.ledger import SpendLedger

TEST_REDIS_DB = 15  # separate from the dev server's db 0, never shared


@pytest.fixture(scope="session")
def engine():
    settings = get_settings()
    eng = create_engine(settings.database_url)
    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture
def db(engine) -> Generator[Session, None, None]:
    session_factory = sessionmaker(bind=engine)
    session = session_factory()
    session.execute(text("TRUNCATE policies, transfers, decisions, intents RESTART IDENTITY CASCADE"))
    session.commit()
    yield session
    session.close()


@pytest.fixture
def redis_client() -> Generator[redis.Redis, None, None]:
    settings = get_settings()
    base_url = settings.redis_url.rsplit("/", 1)[0]
    client = redis.Redis.from_url(f"{base_url}/{TEST_REDIS_DB}", decode_responses=True)
    client.flushdb()
    yield client
    client.flushdb()
    client.close()


@pytest.fixture
def ledger(redis_client) -> SpendLedger:
    return SpendLedger(redis_client)


@pytest.fixture
def policy() -> PolicyConfig:
    return PolicyConfig(
        version=1,
        daily_cap_ngn=Decimal("1000"),
        per_tx_cap_ngn=Decimal("1000"),
        approval_threshold_ngn=Decimal("100000"),  # effectively disabled for these tests
        allowed_categories=frozenset({"delivery"}),
        allowed_recipients=frozenset({"rider_1"}),
        velocity_limit_count=1000,
        velocity_window_seconds=3600,
    )
