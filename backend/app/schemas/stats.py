from pydantic import BaseModel

from app.models.application import ApplicationStatus


# Application count for one status, part of the status-breakdown chart.
class StatusCount(BaseModel):
    status: ApplicationStatus
    count: int


# Average time (in days) applications have spent in a given status's current stage.
class StageDuration(BaseModel):
    status: ApplicationStatus
    avg_days_in_stage: float


# Response shape for GET /stats/overview. See crud/stats.py for exactly how response_rate and
# time_in_stage are computed.
class StatsOverview(BaseModel):
    status_breakdown: list[StatusCount]
    applied_count: int
    responded_count: int
    response_rate: float | None
    time_in_stage: list[StageDuration]
    interviewed_count: int
