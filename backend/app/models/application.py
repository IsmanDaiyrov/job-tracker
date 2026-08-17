import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Enum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


# Enum class representing the possible statuses of a job application, including saved, applied, screening, interview, waiting, offer, rejected, and withdrawn.
class ApplicationStatus(str, enum.Enum):
    saved = "saved"
    applied = "applied"
    screening = "screening"
    interview = "interview"
    # Interviewed and waiting to hear back — distinct from "interview" (actively interviewing)
    # so a busy multi-company pipeline shows at a glance which ones are just pending a reply.
    waiting = "waiting"
    offer = "offer"
    rejected = "rejected"
    withdrawn = "withdrawn"


# SQLAlchemy model for the Application table, representing job applications with fields for user association, company, role title, job description, status, and timestamps.
class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    company: Mapped[str] = mapped_column(nullable=False)
    role_title: Mapped[str] = mapped_column(nullable=False)
    job_description: Mapped[str | None] = mapped_column(Text)
    job_url: Mapped[str | None]
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.applied,
        nullable=False,
    )
    applied_at: Mapped[date | None]
    notes: Mapped[str | None] = mapped_column(Text)
    # When `status` was last changed — distinct from `updated_at`, which bumps on *any* edit
    # (e.g. editing notes). Used for the "time in stage" dashboard stat; see crud/application.py
    # for where this actually gets updated.
    status_changed_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    # One-way flag: set true the first time status reaches screening/interview/offer, and never
    # unset even if status later moves to rejected — so "how many companies did I ever interview
    # with" survives a later rejection, unlike the current `status` field. See
    # crud/application.py's INTERVIEWED_STATUSES for exactly which statuses trigger it.
    ever_interviewed: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
