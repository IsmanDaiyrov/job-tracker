import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


# SQLAlchemy model for the User table, representing users with fields for email, password hash, and timestamps. It enforces a unique constraint on the email field to prevent duplicate entries.
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(nullable=True)
    # Exempts the account from the daily tailoring quota (see crud/user.py) — intended for the
    # app owner's own account, not a general-purpose admin/permissions flag.
    unlimited_tailoring: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    tailor_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tailor_count_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
