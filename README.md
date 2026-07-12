# TransitOps — Smart Transport Operations Platform

A full-stack fleet management system built for a 4-person hackathon.

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
└── README.md
```

---

## Quick Start

### 1. Database Setup
```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE transitops;"
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
| Fuel Logs | `/api/fuel-logs` |
| Expenses | `/api/expenses` |
| Dashboard | `/api/dashboard` |
| Lookup Data | `/api/lookup` |
