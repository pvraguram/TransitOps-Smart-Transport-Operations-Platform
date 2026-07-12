# TransitOps — Smart Transport Operations Platform

A full-stack fleet management system.
---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL 18 |
| Auth | JWT (python-jose + passlib bcrypt) |
| ORM | SQLAlchemy 2 |

---

## Project Structure

```
TransitOps/
├── frontend/   # React + Vite SPA
├── backend/    # FastAPI REST API
├── docs/       # Engineering documentation — start with docs/WORKFLOW.md
└── README.md
```

## Documentation

| Document | What it covers |
|---|---|
| [`docs/WORKFLOW.md`](docs/WORKFLOW.md) | Start here — how the app actually behaves end to end, page by page |
| [`docs/API.md`](docs/API.md) | Verified endpoint reference |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, tech stack rationale |
| [`docs/BACKEND.md`](docs/BACKEND.md) | Backend module structure and layers |
| [`docs/FRONTEND.md`](docs/FRONTEND.md) | Frontend component/routing structure |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Schema, ERD, normalization notes |

---

## Quick Start

### 1. Database Setup
```bash
cd backend
copy .env.example .env       # Edit with your PostgreSQL credentials first
python create_db.py          # Creates the database from DATABASE_URL in .env
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # Edit with your PostgreSQL credentials
uvicorn app.main:app --reload
# API runs at: http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
# App runs at: http://localhost:5173
```

---

## Default Credentials

| Field | Value |
|---|---|
| Email | admin@transitops.com |
| Password | admin123 |

*(Auto-seeded on first backend startup)*

---

## API Overview

| Module | Base Path |
|---|---|
| Auth | `/api/auth` |
| Vehicles | `/api/vehicles` |
| Drivers | `/api/drivers` |
| Trips | `/api/trips` |
| Maintenance | `/api/maintenance` |
| Fuel Logs | `/api/expenses/fuel` |
| Expenses | `/api/expenses` |
| Dashboard | `/api/analytics/dashboard` |
| Lookup Data | `/api/lookup` |

See [`docs/API.md`](docs/API.md) for full request/response shapes, and
[`docs/WORKFLOW.md`](docs/WORKFLOW.md) for how each page uses these endpoints in practice.
