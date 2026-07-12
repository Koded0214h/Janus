from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://janus:janus@localhost:5432/janus"
    redis_url: str = "redis://localhost:6379/0"

    paystack_secret_key: str = ""
    paystack_base_url: str = "https://api.paystack.co"

    float_limit_ngn: int = 2000

    base_url: str = "http://localhost:8000"
    """Used to build the links in approval notifications — set to a reachable URL if the
    approver isn't on localhost."""

    approval_channel: str = "email"  # "email" | "telegram" (telegram is a stub, see approvals/telegram_channel.py)
    approval_timeout_seconds: int = 300

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    approval_email_from: str = ""
    approval_email_to: str = ""

    telegram_bot_token: str = ""
    telegram_chat_id: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
