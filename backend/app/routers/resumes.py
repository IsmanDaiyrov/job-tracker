import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.s3 import (
    delete_object,
    generate_presigned_download_url,
    generate_presigned_upload_url,
    get_object_bytes,
)
from app.core.security import get_current_user
from app.crud.resume import (
    ALLOWED_CONTENT_TYPES,
    create_resume,
    delete_resume,
    get_resume,
    list_resumes,
    update_resume,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.resume import (
    ResumeCreate,
    ResumeDownloadResponse,
    ResumeRead,
    ResumeUpdate,
    ResumeUploadResponse,
)
from app.schemas.tailor import TailorRequest, TailorResult
from app.services.tailoring import tailor_resume

router = APIRouter(prefix="/resumes", tags=["resumes"])


# Receive HTTP requests related to resume/cover letter storage, providing endpoints for listing,
# uploading (via presigned S3 URLs), updating, downloading, and deleting resumes owned by the
# authenticated user. The endpoints enforce ownership checks the same way applications does.


# Dependency to get a resume owned by the current user, raising a 404 error if not found or not owned.
async def _get_owned_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resume = await get_resume(db, current_user.id, resume_id)
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return resume


# List all resumes for the authenticated user.
@router.get("", response_model=list[ResumeRead])
async def list_my_resumes(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await list_resumes(db, current_user.id)


# Start a resume upload: validate the content type, create the DB row, and hand back a presigned
# S3 URL. The frontend uploads the actual file bytes straight to that URL in a separate request.
@router.post("", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def create_my_resume(
    payload: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported content type. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    resume = await create_resume(db, current_user.id, payload)
    upload_url = generate_presigned_upload_url(resume.s3_key, resume.content_type)
    return ResumeUploadResponse(resume=ResumeRead.model_validate(resume), upload_url=upload_url)


# Update a resume owned by the authenticated user — its label and/or whether it's the base resume.
@router.patch("/{resume_id}", response_model=ResumeRead)
async def patch_my_resume(
    payload: ResumeUpdate,
    resume=Depends(_get_owned_resume),
    db: AsyncSession = Depends(get_db),
):
    return await update_resume(db, resume, payload)


# Get a short-lived presigned URL for viewing/downloading a resume's file, since the bucket has no public objects.
@router.get("/{resume_id}/download", response_model=ResumeDownloadResponse)
async def download_my_resume(resume=Depends(_get_owned_resume)):
    return ResumeDownloadResponse(download_url=generate_presigned_download_url(resume.s3_key))


# Delete a resume owned by the authenticated user. The S3 object is deleted first — if that fails,
# the DB row is left in place rather than silently orphaning a file the user can no longer see.
@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_resume(resume=Depends(_get_owned_resume), db: AsyncSession = Depends(get_db)):
    delete_object(resume.s3_key)
    await delete_resume(db, resume)


# Tailor a resume against a job description: fetch the file's bytes from S3 and hand them to Claude
# along with the job description, returning suggested bullet edits and a cover letter draft.
# Nothing about the request or response is persisted.
@router.post("/{resume_id}/tailor", response_model=TailorResult)
async def tailor_my_resume(payload: TailorRequest, resume=Depends(_get_owned_resume)):
    resume_bytes = get_object_bytes(resume.s3_key)
    try:
        return await tailor_resume(resume_bytes, resume.content_type, payload.job_description)
    except ValidationError:
        # Claude's response was cut off mid-generation before finishing valid JSON — most likely
        # a very long resume/job description left too little room under max_tokens to finish.
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The response was cut off before finishing. Try a shorter job description.",
        )
