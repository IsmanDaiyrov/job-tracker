import base64
from functools import lru_cache
from io import BytesIO

import anthropic
from docx import Document

from app.core.config import get_settings
from app.schemas.tailor import TailorResult

# Lazily constructed and cached, rather than built at import time, so a missing API key only
# surfaces when a tailoring request is actually made instead of breaking app startup/tests.
@lru_cache
def _get_client() -> anthropic.AsyncAnthropic:
    return anthropic.AsyncAnthropic(api_key=get_settings().anthropic_api_key)


SYSTEM_PROMPT = (
    "You are helping a job seeker tailor their resume to a specific job posting. Read the "
    "attached resume and the job description, then suggest edits to the resume's existing bullet "
    "points that better surface relevant experience — do not invent experience the resume doesn't "
    "support. For each suggestion, quote the original bullet verbatim, write the suggested "
    "replacement, and give a short phrase naming what in the job description it maps to. Also "
    "draft a short cover letter grounded only in the resume's actual experience."
)


# DOCX has no native document-block support in the Messages API (unlike PDF), so its text is
# extracted locally and sent as plain text instead.
def _extract_docx_text(data: bytes) -> str:
    document = Document(BytesIO(data))
    return "\n".join(paragraph.text for paragraph in document.paragraphs)


# Send a resume + job description to Claude and get back tailored bullet suggestions and a cover
# letter draft. Nothing here is persisted — the caller decides what, if anything, to do with it.
async def tailor_resume(resume_bytes: bytes, content_type: str, job_description: str) -> TailorResult:
    instruction_text = f"Job description:\n\n{job_description}"

    if content_type == "application/pdf":
        content = [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": base64.standard_b64encode(resume_bytes).decode("utf-8"),
                },
            },
            {"type": "text", "text": instruction_text},
        ]
    else:
        resume_text = _extract_docx_text(resume_bytes)
        content = [{"type": "text", "text": f"Resume:\n\n{resume_text}\n\n{instruction_text}"}]

    response = await _get_client().messages.parse(
        model="claude-sonnet-5",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": content}],
        output_format=TailorResult,
    )
    return response.parsed_output
