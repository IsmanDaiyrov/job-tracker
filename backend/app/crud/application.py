import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate


# CRUD operations for the Application model, including listing, retrieving, creating, updating, and deleting applications associated with a user.

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


# Create a new application for a user, committing it to the database and returning the created application.
async def create_application(db: AsyncSession, user_id: uuid.UUID, payload: ApplicationCreate) -> Application:
    application = Application(user_id=user_id, **payload.model_dump())
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


# Update an existing application with new data from the payload, committing changes to the database and returning the updated application.
async def update_application(
    db: AsyncSession, application: Application, payload: ApplicationUpdate
) -> Application:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(application, field, value)
    await db.commit()
    await db.refresh(application)
    return application

# Delete an application from the database, committing the deletion.
async def delete_application(db: AsyncSession, application: Application) -> None:
    await db.delete(application)
    await db.commit()
