# Job Tracker

A single-stop portal for tracking job applications, replacing a spreadsheet-per-search-season habit. Built as a learning project for React/TypeScript, FastAPI, PostgreSQL, and (in later milestones) S3 file storage and Claude-powered resume tailoring.

Foundation phase (this build): application tracking (table + Kanban) with email/password and Google/GitHub sign-in. File storage, AI tailoring, the stats dashboard, and deployment are future milestones.

## Stack

- Frontend: React + TypeScript (Vite), Tailwind CSS v4, react-query, react-router
- Backend: FastAPI, SQLAlchemy 2.0 (async), Alembic, Authlib (OAuth), PyJWT
- Database: PostgreSQL (local via Docker Compose)

## Local setup

### 1. Database

```bash
cp .env.example .env
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App at http://localhost:5173

## OAuth setup (optional for local dev)

Email/password auth and application tracking work without this. To test Google/GitHub sign-in:

1. **Google**: create an OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), authorized redirect URI `http://localhost:8000/auth/google/callback`.
2. **GitHub**: create an OAuth App in [GitHub Developer Settings](https://github.com/settings/developers), authorization callback URL `http://localhost:8000/auth/github/callback`.
3. Drop the client id/secret pairs into `backend/.env`.

## Architecture

### Backend (`backend/app/`)

Layered by responsibility — each folder only knows about the one below it:

| Layer | Folder | Job |
|---|---|---|
| Config/security | `core/` | Env var loading (`config.py`), password hashing + JWT (`security.py`), OAuth client setup (`oauth.py`) |
| Database connection | `db/` | SQLAlchemy engine/session (`session.py`), declarative base (`base.py`) |
| Tables | `models/` | SQLAlchemy classes — what the DB tables actually look like |
| Validation | `schemas/` | Pydantic classes — shape of request/response JSON, separate from the DB models on purpose (see below) |
| Database queries | `crud/` | The actual `SELECT`/`INSERT`/`UPDATE`/`DELETE` logic, framework-agnostic (no HTTP knowledge) |
| HTTP endpoints | `routers/` | Parses requests, checks auth, calls `crud/`, returns responses |
| Schema history | `alembic/` | One migration file per change ever made to the DB schema |

Request flow for anything that touches the database, e.g. `GET /applications`:
```
routers/applications.py   → checks auth (Depends(get_current_user)), calls crud
        ↓
crud/application.py       → runs the actual SELECT via SQLAlchemy
        ↓
models/application.py     → defines what a row looks like
        ↓
PostgreSQL (Docker)
```

### Frontend (`frontend/src/`)

| Folder | Job |
|---|---|
| `routes/` | Full pages — `LandingPage`, `LoginPage`, `ApplicationsTablePage`, `ApplicationsBoardPage`, etc. |
| `components/` | Reusable pieces used by routes — Kanban card/column, form inputs, nav bar |
| `auth/` | Login/session state — `AuthContext` (React Context, not Redux) + `RequireAuth` route guard |
| `hooks/` | Data-fetching logic — `useApplications.ts` wraps all `/applications` calls in React Query |
| `lib/api.ts` | The single `axios` instance every network call goes through — attaches the JWT header, handles 401s globally |
| `types/` | Shared TypeScript types mirroring the backend's Pydantic schemas |

Request flow for a login click, e.g. `AuthContext.login()`:
```
auth/AuthContext.tsx        → calls api.post('/auth/login', ...)
        ↓
lib/api.ts                  → axios sends real HTTP request to localhost:8000
        ↓  (network boundary — separate process/language)
routers/auth.py (backend)   → validates payload, issues a JWT
        ↓
back to AuthContext.tsx     → stores token, fetches /auth/me, updates React state
```

### Key design decisions

- **ORM models and Pydantic schemas are kept separate** (`models/` vs `schemas/`), even though it's more files — this lets API responses diverge from DB columns (e.g. hiding `password_hash`) without reshaping the database.
- **Auth state uses React Context, not Redux.** Redux solves *client* state; your applications data is *server* state (it lives in Postgres, the frontend just caches it), which is what React Query is purpose-built for. Auth session data is small and rarely changes, so Context is enough on its own.
- **JWT lives in `localStorage`**, not an httpOnly cookie — simpler for local dev across different ports (`5173` frontend, `8000` backend); flagged as a hardening item before any real deployment.
- **Native Postgres enums** (`ApplicationStatus`, `OAuthProvider`) instead of plain strings — DB-level validation, at the cost of enum changes needing a slightly more careful migration later.

## Roadmap

- [x] **Foundation** — email/password + Google/GitHub auth, application CRUD, table + Kanban board, landing page
- [ ] **File storage** — resume/cover letter upload to S3, presigned URLs
- [ ] **AI tailoring** — Claude API integration for tailored bullets + cover letter drafts
- [ ] **Dashboard** — stats endpoint + charts (status breakdown, response rate, time-in-stage)
- [ ] **Deploy** — Postgres + API on Render/Fly, frontend on Vercel/Netlify

## Project layout

```
backend/   FastAPI app, SQLAlchemy models, Alembic migrations
frontend/  Vite + React + TypeScript app
```
