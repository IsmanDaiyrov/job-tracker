import boto3
from botocore.config import Config

from app.core.config import get_settings

settings = get_settings()

# boto3 defaults to the legacy global "s3.amazonaws.com" endpoint, which AWS
# redirects away from for any bucket outside us-east-1. That redirect breaks
# CORS for browser fetch() calls, so we force the region-specific endpoint
# explicitly (e.g. "s3.us-east-2.amazonaws.com") to avoid the redirect entirely.
_client = boto3.client(
    "s3",
    region_name=settings.aws_region,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    endpoint_url=f"https://s3.{settings.aws_region}.amazonaws.com",
    config=Config(signature_version="s3v4"),
)


# Generate a short-lived URL the frontend can PUT the actual file bytes to directly, bypassing our
# backend entirely. Signing ContentType into the URL means S3 rejects the upload if the browser
# sends a different Content-Type header than what was approved when the URL was issued.
def generate_presigned_upload_url(key: str, content_type: str, expires_in: int = 300) -> str:
    return _client.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.aws_s3_bucket, "Key": key, "ContentType": content_type},
        ExpiresIn=expires_in,
    )


# Generate a short-lived URL for viewing/downloading a file directly from S3 — needed because the
# bucket has no public objects, so this signed URL is the only way to read a file back out.
def generate_presigned_download_url(key: str, expires_in: int = 300) -> str:
    return _client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.aws_s3_bucket, "Key": key},
        ExpiresIn=expires_in,
    )


# Permanently delete a file from S3 by its key.
def delete_object(key: str) -> None:
    _client.delete_object(Bucket=settings.aws_s3_bucket, Key=key)
