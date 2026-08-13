# Job Tracker

A single-stop portal for tracking job applications, replacing a spreadsheet-per-search-season habit. Built as a learning project for React/TypeScript, FastAPI, PostgreSQL, S3 file storage, and Claude-powered resume tailoring.

Built so far: application tracking (table + Kanban) with email/password and Google/GitHub sign-in, a resume library backed by S3, and AI-assisted resume tailoring against a job description. The stats dashboard and deployment are still future milestones.

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

## AWS S3 setup (needed for resume uploads)

Resume/cover letter storage uses real S3 with presigned URLs — the app itself works without it (you just can't upload files), but the resumes feature needs:

1. Create an S3 bucket. Leave **"Block all public access" on** (the default) — presigned URLs are the only access path, objects are never public.
2. Set the bucket's **CORS configuration** (this is the step most likely to be missed — a missing/wrong CORS config shows up as an opaque browser CORS error, not an S3 auth error):
   ```json
   [{"AllowedOrigins": ["http://localhost:5173"], "AllowedMethods": ["PUT", "GET"], "AllowedHeaders": ["*"], "ExposeHeaders": ["ETag"], "MaxAgeSeconds": 3000}]
   ```
3. Create a dedicated IAM user (programmatic access, no console password) and attach this inline policy, with your real bucket name substituted in:
   ```json
   {"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"], "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"}]}
   ```
4. Generate an access key for that IAM user and drop the values into `backend/.env`:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_S3_BUCKET=
   ```

## Claude API setup (needed for resume tailoring)

The Tailor page calls the Claude API directly — the rest of the app works without it, but that one feature needs a real key:

1. Create an API key in the [Anthropic Console](https://console.anthropic.com) (the Individual workspace is fine for local dev; add billing, since usage is pay-as-you-go rather than covered by any claude.ai subscription).
2. Drop it into `backend/.env`:
   ```
   ANTHROPIC_API_KEY=
   ```
3. **Restart the backend manually after adding or changing the key.** `Settings` is cached per-process (`@lru_cache` on `get_settings()`), and `uvicorn --reload` only watches `.py` files, not `.env` — so a running dev server won't pick up a new key on its own and will keep failing until it's restarted.

## Architecture

### Backend (`backend/app/`)

Layered by responsibility — each folder only knows about the one below it:

| Layer | Folder | Job |
|---|---|---|
| Config/security | `core/` | Env var loading (`config.py`), password hashing + JWT (`security.py`), OAuth client setup (`oauth.py`), S3 presigned URLs (`s3.py`) |
| Database connection | `db/` | SQLAlchemy engine/session (`session.py`), declarative base (`base.py`) |
| Tables | `models/` | SQLAlchemy classes — what the DB tables actually look like |
| Validation | `schemas/` | Pydantic classes — shape of request/response JSON, separate from the DB models on purpose (see below) |
| Database queries | `crud/` | The actual `SELECT`/`INSERT`/`UPDATE`/`DELETE` logic, framework-agnostic (no HTTP knowledge) |
| External API calls | `services/` | Logic that talks to a third-party API rather than the database — currently just `tailoring.py` (Claude). Kept separate from `crud/` since it's not a DB query, and separate from `routers/` so the HTTP layer doesn't own prompt-building or SDK calls directly |
| HTTP endpoints | `routers/` | Parses requests, checks auth, calls `crud/`/`services/`, returns responses |
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
| `routes/` | Full pages — `LandingPage`, `LoginPage`, `ApplicationsTablePage`, `ApplicationsBoardPage`, `ResumesPage`, `TailorPage`, etc. |
| `components/` | Reusable pieces used by routes — Kanban card/column, form inputs, nav bar, resume upload form/list, the tailor form + results panel |
| `auth/` | Login/session state — `AuthContext` (React Context, not Redux) + `RequireAuth` route guard |
| `hooks/` | Data-fetching logic — `useApplications.ts` / `useResumes.ts` / `useTailor.ts` wrap their respective API calls in React Query; `useApplicationSearch.ts` filters the cached list client-side, with the search term kept in the URL (`?q=`) rather than component state |
| `lib/api.ts` | The single `axios` instance every network call goes through — attaches the JWT header, handles 401s globally |
| `lib/tailorCache.ts` | Caches the last successful tailoring result in `sessionStorage` so an accidental refresh doesn't lose it and force a re-generate (a real, billed API call) |
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

Resume upload is a three-hop flow, not a single request — the backend only ever handles metadata, never the file bytes:
```
hooks/useResumes.ts (useUploadResume)
        ↓  1. POST /resumes { label, content_type }
routers/resumes.py          → creates the DB row, asks core/s3.py to sign an upload URL
        ↓  2. returns { resume, upload_url }
useUploadResume             → does a bare fetch() PUT of the raw file directly to upload_url
        ↓  (goes straight to AWS — never touches our backend)
S3 bucket
```

### Key design decisions

- **ORM models and Pydantic schemas are kept separate** (`models/` vs `schemas/`), even though it's more files — this lets API responses diverge from DB columns (e.g. hiding `password_hash`) without reshaping the database.
- **Auth state uses React Context, not Redux.** Redux solves *client* state; your applications data is *server* state (it lives in Postgres, the frontend just caches it), which is what React Query is purpose-built for. Auth session data is small and rarely changes, so Context is enough on its own.
- **JWT lives in `localStorage`**, not an httpOnly cookie — simpler for local dev across different ports (`5173` frontend, `8000` backend); flagged as a hardening item before any real deployment.
- **Native Postgres enums** (`ApplicationStatus`, `OAuthProvider`) instead of plain strings — DB-level validation, at the cost of enum changes needing a slightly more careful migration later.
- **Resume rows are created optimistically, before the S3 upload happens** — not a two-step presign-then-confirm state machine. A failed upload can leave an orphaned DB row with no matching S3 object (harmless, just delete it), which is a simpler tradeoff than adding a `pending`/`complete` status column for a solo-user app.
- **`core/s3.py` forces the regional S3 endpoint explicitly** (`s3.<region>.amazonaws.com`), rather than letting boto3 default to the legacy global `s3.amazonaws.com`. For any bucket outside `us-east-1`, that default endpoint causes AWS to redirect — and since the browser's `fetch()` PUT is a cross-origin request, that redirect surfaces as a generic CORS error rather than a clear "wrong endpoint" message. Worth knowing if you ever see a CORS failure that a correct CORS config doesn't fix.
- **Application search is client-side, filtering the already-cached list** — not a `?search=` param on `GET /applications`. At personal-project scale (dozens to a few hundred rows) this is simpler and instant, with no per-keystroke network round-trip. The search term lives in the URL (`?q=`) rather than component state, so it survives switching between Table and Board — `NavBar.tsx`'s links deliberately carry the current `location.search` forward for exactly this reason.
- **New enum values on a native Postgres enum need a hand-written migration**, not `--autogenerate` — Alembic's default comparator doesn't reliably detect added members on an existing enum type (see the `withdrawn` status migration for the pattern: a bare `ALTER TYPE ... ADD VALUE`, with `downgrade()` left as a no-op since Postgres has no `DROP VALUE`).
- **Resume tailoring is a standalone page, not an action on an application record.** Tailoring naturally happens *before* you've applied — you paste the job description in fresh each time, tailor, apply on the company's site, and only then log the application — so tying it to a saved application (via an edit modal, say) would put the feature in the wrong place in that sequence.
- **Nothing about a tailoring request is persisted server-side** — no DB table, no history. The last successful result is cached client-side only, in `sessionStorage` (survives a refresh, clears on tab close or logout), which is enough to protect against losing a result to an accidental refresh without indefinitely storing job description text in the database.
- **PDF resumes are sent to Claude as a native `document` content block; DOCX resumes are text-extracted locally first** (via `python-docx`) — the Messages API reads PDF natively but has no equivalent for DOCX.
- **`max_tokens` has real headroom (8192) and truncated responses fail cleanly.** A long resume + long job description can push a structured-output response past a tight token ceiling, which fails JSON validation mid-parse; the router catches that specific failure and returns a clear 502 rather than letting it surface as an opaque 500.

## Roadmap

- [x] **Foundation** — email/password + Google/GitHub auth, application CRUD, table + Kanban board, landing page
- [x] **File storage** — resume library, presigned S3 upload/download, verified end-to-end against a real bucket
- [x] **AI tailoring** — standalone Tailor page; Claude API integration for tailored bullets + cover letter drafts against a pasted job description
- [ ] **Dashboard** — stats endpoint + charts (status breakdown, response rate, time-in-stage)
- [ ] **Deploy** — Postgres + API on Render/Fly, frontend on Vercel/Netlify

Before opening the deployed app to real users, do these two together (both about the same failure mode — an account-wide Claude billing cutoff — so no reason to split them across separate sessions):
- [ ] Set a monthly spend limit on the Anthropic account, in the Console's Billing/Limits settings — a backstop in case per-user rate limiting (already built, see Key design decisions) isn't enough to bound cost.
- [ ] Catch `anthropic.PermissionDeniedError` (403, `billing_error`) in `routers/resumes.py`'s tailor endpoint, same pattern as the existing `ValidationError` → 502 handling — right now a billing cutoff would surface as an opaque 500 instead of a clear "temporarily unavailable" message, and unlike the per-user rate limit's 429, this failure mode hits every user at once.

## Project layout

```
backend/   FastAPI app, SQLAlchemy models, Alembic migrations
frontend/  Vite + React + TypeScript app
```
