import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate

# Content types accepted for resume uploads, mapped to the file extension used when building the S3 key.
ALLOWED_CONTENT_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}


# Retrieve all resumes belonging to a user, most recently uploaded first.
async def list_resumes(db: AsyncSession, user_id: uuid.UUID) -> list[Resume]:
    result = await db.execute(
        select(Resume).where(Resume.user_id == user_id).order_by(Resume.created_at.desc())
    )
    return list(result.scalars().all())


# Retrieve a single resume by id, scoped to its owner, returning None if not found or not owned.
async def get_resume(db: AsyncSession, user_id: uuid.UUID, resume_id: uuid.UUID) -> Resume | None:
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id))
    return result.scalar_one_or_none()


# Create a new resume row ahead of the actual file upload: generates the row's id first so it can be
# used to build a collision-free S3 key, then commits the row before any file bytes exist in S3.
async def create_resume(db: AsyncSession, user_id: uuid.UUID, payload: ResumeCreate) -> Resume:
    resume_id = uuid.uuid4()
    ext = ALLOWED_CONTENT_TYPES[payload.content_type]
    s3_key = f"resumes/{user_id}/{resume_id}.{ext}"

    resume = Resume(
        id=resume_id,
        user_id=user_id,
        label=payload.label,
        s3_key=s3_key,
        content_type=payload.content_type,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


# Update a resume's label and/or base status. If is_base is being set to True, first unsets is_base
# on every other resume for that user so only one resume is ever marked as the base at a time.
async def update_resume(db: AsyncSession, resume: Resume, payload: ResumeUpdate) -> Resume:
    data = payload.model_dump(exclude_unset=True)

    if data.get("is_base") is True:
        await db.execute(
            update(Resume).where(Resume.user_id == resume.user_id, Resume.id != resume.id).values(is_base=False)
        )

    for field, value in data.items():
        setattr(resume, field, value)

    await db.commit()
    await db.refresh(resume)
    return resume


# Delete a resume's database row. The caller is responsible for deleting the matching S3 object first.
async def delete_resume(db: AsyncSession, resume: Resume) -> None:
    await db.delete(resume)
    await db.commit()
