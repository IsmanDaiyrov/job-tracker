// A resume/cover letter record, mirroring the backend's ResumeRead schema.
export interface Resume {
  id: string
  user_id: string
  label: string
  content_type: string
  is_base: boolean
  created_at: string
}

// Response from POST /resumes: the saved record plus the presigned S3 URL to upload the actual file to.
export interface ResumeUploadResponse {
  resume: Resume
  upload_url: string
}

// Response from GET /resumes/{id}/download: a short-lived presigned URL for viewing the file.
export interface ResumeDownloadResponse {
  download_url: string
}

// File types the upload form accepts, matching the backend's ALLOWED_CONTENT_TYPES allowlist.
export const ALLOWED_RESUME_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

// Client-side size cap enforced before ever calling the API — not mirrored server-side, since a
// resume is never legitimately larger than this for a personal-use app.
export const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024
