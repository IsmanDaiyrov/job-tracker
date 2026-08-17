import uuid
from collections import defaultdict
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus


# Count of applications per status, for a user.
async def get_status_counts(db: AsyncSession, user_id: uuid.UUID) -> dict[ApplicationStatus, int]:
    result = await db.execute(
        select(Application.status, func.count(Application.id))
        .where(Application.user_id == user_id)
        .group_by(Application.status)
    )
    return dict(result.all())


# Average time (in days) applications have spent in their current status, per status. Computed
# in Python rather than SQL (e.g. Postgres's EXTRACT(EPOCH FROM ...)) so it behaves identically
# across Postgres (prod) and SQLite (tests) — at personal-project scale there's no performance
# reason to push this into the database instead.
async def get_avg_days_in_stage(db: AsyncSession, user_id: uuid.UUID) -> dict[ApplicationStatus, float]:
    result = await db.execute(
        select(Application.status, Application.status_changed_at).where(Application.user_id == user_id)
    )

    ages_by_status: dict[ApplicationStatus, list[float]] = defaultdict(list)
    now = datetime.utcnow()
    for status, changed_at in result.all():
        ages_by_status[status].append((now - changed_at).total_seconds() / 86400)

    return {status: sum(ages) / len(ages) for status, ages in ages_by_status.items()}


# Count of applications that ever reached interview stage (ever_interviewed), regardless of
# current status — a rejection afterward doesn't remove it from this count. See
# crud/application.py's INTERVIEWED_STATUSES for exactly what sets the flag.
async def get_interviewed_count(db: AsyncSession, user_id: uuid.UUID) -> int:
    result = await db.execute(
        select(func.count(Application.id)).where(
            Application.user_id == user_id, Application.ever_interviewed.is_(True)
        )
    )
    return result.scalar_one()
