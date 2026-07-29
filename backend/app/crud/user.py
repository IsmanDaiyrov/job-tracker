import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.oauth_account import OAuthAccount, OAuthProvider
from app.models.user import User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    return (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    return (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()


async def create_user(db: AsyncSession, email: str, password_hash: str | None) -> User:
    user = User(email=email, password_hash=password_hash)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_oauth_account(
    db: AsyncSession, provider: OAuthProvider, provider_account_id: str
) -> OAuthAccount | None:
    return (
        await db.execute(
            select(OAuthAccount).where(
                OAuthAccount.provider == provider,
                OAuthAccount.provider_account_id == provider_account_id,
            )
        )
    ).scalar_one_or_none()


async def link_oauth_account(
    db: AsyncSession, user_id: uuid.UUID, provider: OAuthProvider, provider_account_id: str
) -> OAuthAccount:
    account = OAuthAccount(user_id=user_id, provider=provider, provider_account_id=provider_account_id)
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


async def get_or_create_user_from_oauth(
    db: AsyncSession, provider: OAuthProvider, provider_account_id: str, email: str
) -> User:
    existing_account = await get_oauth_account(db, provider, provider_account_id)
    if existing_account is not None:
        user = await get_user_by_id(db, existing_account.user_id)
        assert user is not None
        return user

    user = await get_user_by_email(db, email)
    if user is None:
        user = await create_user(db, email=email, password_hash=None)

    await link_oauth_account(db, user.id, provider, provider_account_id)
    return user
