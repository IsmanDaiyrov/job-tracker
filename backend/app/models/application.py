import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Enum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


# Enum class representing the possible statuses of a job application, including saved, applied, screening, interview, offer, rejected, and withdrawn.
class ApplicationStatus(str, enum.Enum):
    saved = "saved"
    applied = "applied"
    screening = "screening"
    interview = "interview"
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
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
