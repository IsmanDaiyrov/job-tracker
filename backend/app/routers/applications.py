import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.crud.application import (
    create_application,
    delete_application,
    get_application,
    list_applications,
    update_application,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


async def _get_owned_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    application = await get_application(db, current_user.id, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application


@router.get("", response_model=list[ApplicationRead])
async def list_my_applications(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return await list_applications(db, current_user.id)


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_my_application(
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_application(db, current_user.id, payload)


@router.get("/{application_id}", response_model=ApplicationRead)
async def get_my_application(application=Depends(_get_owned_application)):
    return application


@router.patch("/{application_id}", response_model=ApplicationRead)
async def patch_my_application(
    payload: ApplicationUpdate,
    application=Depends(_get_owned_application),
    db: AsyncSession = Depends(get_db),
):
    return await update_application(db, application, payload)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_application(application=Depends(_get_owned_application), db: AsyncSession = Depends(get_db)):
    await delete_application(db, application)
