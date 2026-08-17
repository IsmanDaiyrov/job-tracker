from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.crud.stats import get_avg_days_in_stage, get_interviewed_count, get_status_counts
from app.db.session import get_db
from app.models.application import ApplicationStatus
from app.models.user import User
from app.schemas.stats import StageDuration, StatsOverview, StatusCount

router = APIRouter(prefix="/stats", tags=["stats"])


# Aggregate dashboard stats for the authenticated user's applications: status breakdown,
# response rate, and average time spent in each status's current stage.
#
# response_rate is deliberately built on ever_interviewed rather than current status: a bare
# rejection with no screening/interview doesn't count as a "response" (that's the whole reason
# ever_interviewed exists — a company that never engaged shouldn't inflate this number), and an
# application that *did* interview still counts even after a later rejection, since filtering on
# current status alone would make it silently drop out the moment it's rejected.
@router.get("/overview", response_model=StatsOverview)
async def get_stats_overview(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    status_counts = await get_status_counts(db, current_user.id)
    avg_days_in_stage = await get_avg_days_in_stage(db, current_user.id)
    interviewed_count = await get_interviewed_count(db, current_user.id)

    applied_count = sum(count for status, count in status_counts.items() if status != ApplicationStatus.saved)
    responded_count = interviewed_count

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
