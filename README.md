# ADF Marketplace

A marketplace for uploading, browsing, and downloading `.adf` (Agent Definition Format) files — think "Hugging Face but for Rawl agents."

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ running locally
- (Optional) AWS credentials for S3 storage in production

## Backend Setup

### 1. Create and activate a virtual environment

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
# From the repo root
cp .env.example .env
```

Open `.env` and set `DATABASE_URL` to match your local PostgreSQL instance, e.g.:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/adf_marketplace
```

### 4. Create the database

```sql
-- Run in psql or your preferred PostgreSQL client:
CREATE DATABASE adf_marketplace;
```

### 5. Run the development server

```bash
# From backend/
uvicorn main:app --reload
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

## Running Tests

```bash
# From backend/
pytest tests/ -v
```

The DB connectivity test requires a live PostgreSQL instance matching `DATABASE_URL` in `.env`.

## Storage Backends

Set `STORAGE_BACKEND` in `.env`:

| Value | Behaviour |
|---|---|
| `local` (default) | Files saved to `LOCAL_STORAGE_PATH` on disk |
| `s3` | Files uploaded to `AWS_S3_BUCKET_NAME` |

When using `s3`, also fill in `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, and `AWS_S3_REGION`. If running on an EC2 instance with an IAM role, you can leave the key fields blank and boto3 will use the instance profile.

## GitHub OAuth Setup

1. Go to https://github.com/settings/applications/new
2. Set **Homepage URL** to `http://localhost:3000` (dev) or your production URL
3. Set **Authorization callback URL** to `http://localhost:8000/auth/github/callback`
4. Copy the **Client ID** and generate a **Client Secret**
5. Add both to `.env` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

> OAuth logic is not implemented yet — this is stubbed for a future session.

## Project Structure

```
backend/
├── main.py          # FastAPI app entry point
├── config.py        # Settings loaded from .env via pydantic-settings
├── db/              # SQLAlchemy engine and session factory
├── storage/         # Storage abstraction (local filesystem + S3)
├── routers/         # Route handlers (health, and more in future sessions)
└── tests/           # pytest test suite
```
