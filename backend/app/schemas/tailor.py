from pydantic import BaseModel


# Request body for tailoring a resume against a job description, sent fresh each time —
# nothing about a tailoring request is persisted.
class TailorRequest(BaseModel):
    job_description: str


# A single tailored bullet: the original line, the suggested replacement, and a short note on
# why it maps to something in the job description. Also passed to Claude as the output schema.
class BulletSuggestion(BaseModel):
    original: str
    suggested: str
    why: str


# Full response: suggested bullet edits plus a cover letter draft. Reused as both the API
# response_model and the schema Claude's structured output is validated against.
class TailorResult(BaseModel):
    bullets: list[BulletSuggestion]
    cover_letter: str
