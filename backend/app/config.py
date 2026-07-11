from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://janus:janus@localhost:5432/janus"
    redis_url: str = "redis://localhost:6379/0"

    paystack_secret_key: str = ""
    paystack_base_url: str = "https://api.paystack.co"

    float_limit_ngn: int = 2000

    telegram_bot_token: str = ""
    telegram_chat_id: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
