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
    # Manual override for the auto-managed ever_interviewed flag — omit it to let
    # update_application's normal auto-detection run; only set it to correct a mistake (e.g. the
    # status was set to Interview by accident and shouldn't have counted).
    ever_interviewed: bool | None = None


class ApplicationRead(ApplicationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    status_changed_at: datetime
    ever_interviewed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
