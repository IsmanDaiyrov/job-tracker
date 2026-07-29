import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate


async def list_applications(db: AsyncSession, user_id: uuid.UUID) -> list[Application]:
    result = await db.execute(
        select(Application).where(Application.user_id == user_id).order_by(Application.created_at.desc())
    )
    return list(result.scalars().all())


async def get_application(db: AsyncSession, user_id: uuid.UUID, application_id: uuid.UUID) -> Application | None:
    result = await db.execute(
        select(Application).where(Application.id == application_id, Application.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_application(db: AsyncSession, user_id: uuid.UUID, payload: ApplicationCreate) -> Application:
    application = Application(user_id=user_id, **payload.model_dump())
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


async def update_application(
    db: AsyncSession, application: Application, payload: ApplicationUpdate
) -> Application:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(application, field, value)
    await db.commit()
    await db.refresh(application)
    return application


async def delete_application(db: AsyncSession, application: Application) -> None:
    await db.delete(application)
    await db.commit()
