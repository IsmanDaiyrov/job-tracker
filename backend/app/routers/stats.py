from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.crud.stats import RESPONDED_STATUSES, get_avg_days_in_stage, get_interviewed_count, get_status_counts
from app.db.session import get_db
from app.models.application import ApplicationStatus
from app.models.user import User
from app.schemas.stats import StageDuration, StatsOverview, StatusCount

router = APIRouter(prefix="/stats", tags=["stats"])


# Aggregate dashboard stats for the authenticated user's applications: status breakdown,
# response rate, and average time spent in each status's current stage. See crud/stats.py for
# the exact definitions (e.g. which statuses count as "responded").
@router.get("/overview", response_model=StatsOverview)
async def get_stats_overview(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    status_counts = await get_status_counts(db, current_user.id)
    avg_days_in_stage = await get_avg_days_in_stage(db, current_user.id)
    interviewed_count = await get_interviewed_count(db, current_user.id)

    applied_count = sum(count for status, count in status_counts.items() if status != ApplicationStatus.saved)
    responded_count = sum(count for status, count in status_counts.items() if status in RESPONDED_STATUSES)

    return StatsOverview(
        status_breakdown=[StatusCount(status=status, count=count) for status, count in status_counts.items()],
        applied_count=applied_count,
        responded_count=responded_count,
        response_rate=(responded_count / applied_count) if applied_count > 0 else None,
        time_in_stage=[
            StageDuration(status=status, avg_days_in_stage=days) for status, days in avg_days_in_stage.items()
        ],
        interviewed_count=interviewed_count,
    )
