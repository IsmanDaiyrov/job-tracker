import uuid
from datetime import datetime

from pydantic import BaseModel


# Request body for creating a resume: just the label and file's content type, sent before the actual file bytes exist anywhere.
class ResumeCreate(BaseModel):
    label: str
    content_type: str


# Request body for updating a resume's label and/or marking it as the base resume.
class ResumeUpdate(BaseModel):
    label: str | None = None
    is_base: bool | None = None


# Response shape for a resume, built from the ORM object via from_attributes.
class ResumeRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    label: str
    content_type: str
    is_base: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Response returned right after creating a resume: the saved record plus the presigned S3 URL the frontend uploads the actual file to.
class ResumeUploadResponse(BaseModel):
    resume: ResumeRead
    upload_url: str


# Response containing a short-lived presigned URL for viewing/downloading a resume's file.
class ResumeDownloadResponse(BaseModel):
    download_url: str
