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

# Receive HTTP requests related to job applications, providing endpoints for listing, creating, retrieving, updating, and deleting applications associated with the authenticated user. 
# The endpoints utilize CRUD operations and enforce ownership checks to ensure users can only manage their own applications.

# Dependency to get an application owned by the current user, raising a 404 error if not found.
async def _get_owned_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    application = await get_application(db, current_user.id, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application


# List all applications for the authenticated user, returning them in descending order of creation date.
@router.get("", response_model=list[ApplicationRead])
async def list_my_applications(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return await list_applications(db, current_user.id)


# Create a new application for the authenticated user, returning the created application.
@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_my_application(
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_application(db, current_user.id, payload)


# Get a specific application owned by the authenticated user, returning it if found.
@router.get("/{application_id}", response_model=ApplicationRead)
async def get_my_application(application=Depends(_get_owned_application)):
    return application


# Update an existing application owned by the authenticated user with new data from the payload, returning the updated application.
@router.patch("/{application_id}", response_model=ApplicationRead)
async def patch_my_application(
    payload: ApplicationUpdate,
    application=Depends(_get_owned_application),
    db: AsyncSession = Depends(get_db),
):
    return await update_application(db, application, payload)


# Delete an application owned by the authenticated user, returning a 204 No Content status code upon successful deletion.
@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_application(application=Depends(_get_owned_application), db: AsyncSession = Depends(get_db)):
    await delete_application(db, application)
