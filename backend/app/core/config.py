from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Settings class for application configuration, loaded from environment variables or a .env file.
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    frontend_url: str = "http://localhost:5173"

    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""

    aws_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_s3_bucket: str = ""

    anthropic_api_key: str = ""

    # Managed Postgres providers (Render, Railway, Heroku, ...) hand out connection strings as
    # postgres:// or postgresql://, not the asyncpg-specific scheme this app's async engine and
    # Alembic both need — rewrite it here so the raw provider URL can be pasted in as-is.
    @field_validator("database_url")
    @classmethod
    def _use_asyncpg_driver(cls, v: str) -> str:
        if v.startswith("postgres://"):
            return "postgresql+asyncpg://" + v[len("postgres://") :]
        if v.startswith("postgresql://"):
            return "postgresql+asyncpg://" + v[len("postgresql://") :]
        return v

# Returns the application settings, cached for performance.
@lru_cache
def get_settings() -> Settings:
    return Settings()
