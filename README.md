# ☕ منوی آنلاین کافه

یک اپلیکیشن کامل برای مدیریت و نمایش منوی کافه، با پشتیبانی از زبان فارسی (RTL).

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | FastAPI · SQLAlchemy 2 (async) · PostgreSQL |
| Frontend  | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Auth      | JWT (python-jose) · env-var credentials |
| Storage   | Local filesystem (Docker volume)    |
| Infra     | Docker · Docker Compose             |

---

## Project Structure

```
coffee-menu/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # FastAPI app, lifespan, CORS
│       ├── config.py        # Settings (pydantic-settings)
│       ├── database.py      # Async SQLAlchemy engine & session
│       ├── models.py        # Category, MenuItem ORM models
│       ├── schemas.py       # Pydantic request/response schemas
│       ├── auth.py          # JWT creation & verification
│       └── routers/
│           ├── auth.py      # POST /api/admin/login
│           ├── categories.py
│           └── menu.py
└── frontend/
    ├── Dockerfile
    ├── next.config.mjs
    └── src/
        ├── app/
        │   ├── page.tsx          # Public Persian menu
        │   ├── layout.tsx
        │   └── admin/
        │       ├── layout.tsx    # JWT auth guard
        │       ├── page.tsx      # Admin dashboard
        │       └── login/page.tsx
        └── lib/
            └── api.ts            # Axios clients & API helpers
```

---

## Quick Start

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```dotenv
POSTGRES_PASSWORD=your_db_password
SECRET_KEY=your-random-secret-min-32-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

### 2. Run with Docker Compose

```bash
docker compose up --build
```

| Service       | URL                          |
|---------------|------------------------------|
| Customer menu | http://localhost:3000        |
| Admin panel   | http://localhost:3000/admin  |
| API docs      | http://localhost:8000/docs   |

---

## API Endpoints

### Public

| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/categories`           | List all categories      |
| GET    | `/api/menu`                 | List available items     |
| GET    | `/api/menu?category_id=1`   | Filter by category       |
| GET    | `/media/{filename}`         | Serve uploaded photos    |

### Admin (Bearer token required)

| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| POST   | `/api/admin/login`          | Get JWT token            |
| GET    | `/api/admin/menu`           | List all items (incl. unavailable) |
| POST   | `/api/admin/menu`           | Create item (multipart)  |
| PUT    | `/api/admin/menu/{id}`      | Update item (multipart)  |
| DELETE | `/api/admin/menu/{id}`      | Delete item              |
| POST   | `/api/admin/categories`     | Create category          |
| DELETE | `/api/admin/categories/{id}`| Delete category          |

---

## Features

- **Persian RTL UI** — Vazirmatn font, full right-to-left layout
- **Customer menu** — category filter tabs, live search, responsive card grid
- **Admin dashboard** — CRUD for items and categories, photo upload with preview
- **Photo upload** — JPG / PNG / WebP, max 5 MB, stored in Docker volume
- **JWT auth** — 24-hour tokens, credentials from env vars
- **Auto DB init** — tables created on first startup, no migration step needed

---

## Environment Variables

| Variable                   | Default            | Description                        |
|----------------------------|--------------------|------------------------------------|
| `POSTGRES_USER`            | `postgres`         | DB username                        |
| `POSTGRES_PASSWORD`        | —                  | DB password (required)             |
| `POSTGRES_DB`              | `coffee_menu`      | DB name                            |
| `SECRET_KEY`               | —                  | JWT signing key (min 32 chars)     |
| `ADMIN_USERNAME`           | `admin`            | Admin login username               |
| `ADMIN_PASSWORD`           | —                  | Admin login password               |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440`          | Token lifetime (default 24h)       |
| `MAX_FILE_SIZE_MB`         | `5`                | Max photo upload size              |
| `NEXT_PUBLIC_API_URL`      | `http://localhost:8000` | Backend URL (seen by browser) |

---

## Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL in environment or .env
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```
