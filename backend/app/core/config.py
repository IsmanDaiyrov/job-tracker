from functools import lru_cache

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

# Returns the application settings, cached for performance.
@lru_cache
def get_settings() -> Settings:
    return Settings()
