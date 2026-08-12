from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import get_settings
from app.routers import applications, auth, resumes

settings = get_settings()

app = FastAPI(title="Job Tracker API")

# Session cookie is only used transiently to hold the OAuth state/nonce during
# the redirect round-trip (Authlib's Starlette integration requires it) — it's
# not used for authenticating requests, which stay stateless via JWT bearer tokens.
app.add_middleware(SessionMiddleware, secret_key=settings.jwt_secret)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(resumes.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Future routers plug in here: /stats/overview
