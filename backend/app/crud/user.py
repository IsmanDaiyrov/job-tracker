import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.oauth_account import OAuthAccount, OAuthProvider
from app.models.user import User

# CRUD operations for the User model, including retrieving users by email or ID, creating new users, and managing OAuth accounts linked to users.

# Cap on tailoring requests per account per day, to bound API cost exposure once this app has
# users other than its own owner. Accounts with unlimited_tailoring set bypass this entirely.
DAILY_TAILOR_LIMIT = 5

# Retrieve a user by their email address, returning None if not found.
async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    return (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()


# Retrieve a user by their unique ID, returning None if not found.
async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    return (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()


# Create a new user with the specified email and password hash, committing it to the database and returning the created user.
async def create_user(db: AsyncSession, email: str, password_hash: str | None) -> User:
    user = User(email=email, password_hash=password_hash)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# Retrieve an OAuth account by provider and provider account ID, returning None if not found.
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


# Link an OAuth account to a user by creating a new OAuthAccount entry in the database, committing it, and returning the created account.
async def link_oauth_account(
    db: AsyncSession, user_id: uuid.UUID, provider: OAuthProvider, provider_account_id: str
) -> OAuthAccount:
    account = OAuthAccount(user_id=user_id, provider=provider, provider_account_id=provider_account_id)
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


# Get or create a user based on OAuth provider information. If an existing OAuth account is found, retrieve the associated user. If not, check if a user with the provided email exists; if not, create a new user. Finally, link the OAuth account to the user and return the user.
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


# Check whether a user has tailoring quota left today, consuming one unit of it if so. The
# counter resets automatically the first time it's checked on a new day — there's no separate
# cron/scheduled job resetting it. Returns False (without consuming anything) once the daily
# limit is reached; unlimited_tailoring accounts always return True.
async def consume_tailor_quota(db: AsyncSession, user: User) -> bool:
    if user.unlimited_tailoring:
        return True

    today = date.today()
    if user.tailor_count_date != today:
        user.tailor_count = 0
        user.tailor_count_date = today

    if user.tailor_count >= DAILY_TAILOR_LIMIT:
        return False

    user.tailor_count += 1
    await db.commit()
    return True
