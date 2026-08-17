import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate, ApplicationUpdate


# CRUD operations for the Application model, including listing, retrieving, creating, updating, and deleting applications associated with a user.

# Statuses that count as "reached interview stage" for ever_interviewed purposes — a bare
# rejection with no screening/interview never sets it, matching the old spreadsheet's separate
# Interviewed column, which a straight-to-rejected company never touched.
INTERVIEWED_STATUSES = {
    ApplicationStatus.screening,
    ApplicationStatus.interview,
    ApplicationStatus.waiting,
    ApplicationStatus.offer,
}

# List all applications for a specific user, ordered by creation date in descending order.
async def list_applications(db: AsyncSession, user_id: uuid.UUID) -> list[Application]:
    result = await db.execute(
        select(Application).where(Application.user_id == user_id).order_by(Application.created_at.desc())
    )
    return list(result.scalars().all())

# Get a specific application by its ID and the user ID, returning None if not found.
async def get_application(db: AsyncSession, user_id: uuid.UUID, application_id: uuid.UUID) -> Application | None:
    result = await db.execute(
        select(Application).where(Application.id == application_id, Application.user_id == user_id)
    )
    return result.scalar_one_or_none()


# Create a new application for a user, committing it to the database and returning the created
# application. Sets ever_interviewed immediately if created directly at a qualifying status
# (e.g. backfilling a record that's already at "interview").
async def create_application(db: AsyncSession, user_id: uuid.UUID, payload: ApplicationCreate) -> Application:
    application = Application(user_id=user_id, **payload.model_dump())
    if application.status in INTERVIEWED_STATUSES:
        application.ever_interviewed = True
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


# Update an existing application with new data from the payload, committing changes to the database and returning the updated application. Bumps status_changed_at only when status is
# actually changing to a different value — distinct from updated_at, which bumps on any edit.
# ever_interviewed is a one-way flag: set true the moment status reaches a qualifying stage, and
# never reset, even if status later moves to rejected/withdrawn.
async def update_application(
    db: AsyncSession, application: Application, payload: ApplicationUpdate
) -> Application:
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] != application.status:
        application.status_changed_at = datetime.utcnow()
        if data["status"] in INTERVIEWED_STATUSES:
            application.ever_interviewed = True

    for field, value in data.items():
        setattr(application, field, value)
    await db.commit()
    await db.refresh(application)
    return application

# Delete an application from the database, committing the deletion.
async def delete_application(db: AsyncSession, application: Application) -> None:
    await db.delete(application)
    await db.commit()
