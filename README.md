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

## Project layout

```
backend/   FastAPI app, SQLAlchemy models, Alembic migrations
frontend/  Vite + React + TypeScript app
```
