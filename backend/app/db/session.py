from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

# Database engine and session setup for asynchronous operations using SQLAlchemy, with settings loaded from the configuration.
settings = get_settings()

engine = create_async_engine(settings.database_url, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Dependency to get a database session for asynchronous operations, yielding an AsyncSession instance.
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
