import uuid
from datetime import date, datetime

from pydantic import BaseModel

from app.models.application import ApplicationStatus


class ApplicationBase(BaseModel):
    company: str
    role_title: str
    job_description: str | None = None
    job_url: str | None = None
    status: ApplicationStatus = ApplicationStatus.applied
    applied_at: date | None = None
    notes: str | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company: str | None = None
    role_title: str | None = None
    job_description: str | None = None
    job_url: str | None = None
    status: ApplicationStatus | None = None
    applied_at: date | None = None
    notes: str | None = None


class ApplicationRead(ApplicationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
