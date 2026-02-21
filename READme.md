<p align="center">
  <h1 align="center">🔗 Santosh URL Shortener</h1>
  <p align="center">
    A full-stack, production-ready URL shortener with analytics, QR code generation, and JWT authentication.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/DRF-3.14-A30000?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

---

## ✨ Features

| Feature                           | Description                                                        |
| --------------------------------- | ------------------------------------------------------------------ |
| 🔐 **JWT Authentication**         | Secure register, login, and logout with access + refresh tokens    |
| 🔗 **URL Shortening**             | Generate short links with auto Base62 keys or custom aliases       |
| 📊 **Click Analytics**            | Track total clicks, referrer data, and usage over time             |
| 📱 **QR Code Generation**         | Downloadable QR codes for every shortened URL                      |
| 🎨 **Modern Dashboard**           | Beautiful, responsive UI with charts and real-time data            |
| 🐳 **Docker Support**             | One-command deployment with Docker Compose (PostgreSQL + Gunicorn) |
| 🛡️ **Rate Limiting**              | Configurable throttling to prevent abuse                           |
| 🏗️ **Service-Layer Architecture** | Clean separation of concerns (View → Service → Model)              |

---

## 🏗️ Tech Stack

### Backend

| Technology                | Purpose                    |
| ------------------------- | -------------------------- |
| **Django 4.2**            | Web framework              |
| **Django REST Framework** | RESTful API layer          |
| **Simple JWT**            | Token-based authentication |
| **SQLite / PostgreSQL**   | Database (dev / prod)      |
| **qrcode + Pillow**       | QR code image generation   |
| **Gunicorn**              | Production WSGI server     |
| **Docker**                | Containerized deployment   |

### Frontend

| Technology                | Purpose                      |
| ------------------------- | ---------------------------- |
| **React 19**              | UI library                   |
| **TypeScript 5.9**        | Type safety                  |
| **Vite 7**                | Build tool & dev server      |
| **Tailwind CSS v4**       | Utility-first styling        |
| **Zustand**               | Lightweight state management |
| **React Router v7**       | Client-side routing          |
| **Radix UI**              | Accessible UI primitives     |
| **Recharts**              | Analytics charts             |
| **Framer Motion**         | Animations & transitions     |
| **React Hook Form + Zod** | Form handling & validation   |
| **Axios**                 | HTTP client                  |
| **Sonner**                | Toast notifications          |

---

## 📁 Project Structure

```
santosh-url-shortener/
├── url/
│   ├── backend/                  # Django REST API
│   │   ├── apps/
│   │   │   ├── authentication/   # JWT register/login/logout
│   │   │   ├── common/           # Shared utilities & constants
│   │   │   ├── shortener/        # Core URL shortening domain
│   │   │   └── users/            # Custom user model
│   │   ├── config/
│   │   │   └── settings/
│   │   │       ├── base.py       # Shared settings
│   │   │       ├── development.py # SQLite, debug mode
│   │   │       └── production.py  # PostgreSQL, hardened security
│   │   ├── core/                 # Exceptions, logging, middleware, throttling
│   │   ├── docker/
│   │   │   ├── Dockerfile
│   │   │   └── docker-compose.yml
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   └── frontend/                 # React SPA
│       ├── src/
│       │   ├── api/              # Axios API client layer
│       │   ├── components/
│       │   │   ├── analytics/    # Charts & analytics widgets
│       │   │   ├── auth/         # Login & register forms
│       │   │   ├── layout/       # App shell & protected routes
│       │   │   ├── shared/       # Reusable components
│       │   │   ├── ui/           # Radix UI primitives
│       │   │   └── urls/         # URL management components
│       │   ├── pages/            # Route-level page components
│       │   ├── store/            # Zustand state stores
│       │   ├── types/            # TypeScript type definitions
│       │   └── utils/            # Helper functions
│       ├── package.json
│       ├── vite.config.ts
│       └── README.md
│
└── README.md                     # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** and **pip**
- **Node.js 18+** and **npm**
- **Git**

---

### 🔧 Backend Setup

```bash
# 1. Navigate to backend
cd url/backend

# 2. Create & activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env
# Edit .env and set a secure SECRET_KEY

# 5. Run database migrations
python manage.py makemigrations users
python manage.py makemigrations shortener
python manage.py migrate

# 6. Create admin superuser
python manage.py createsuperuser

# 7. Start the server
python manage.py runserver
```

The API will be available at **http://localhost:8000/api/**.

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to frontend
cd url/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will be available at **http://localhost:5173**.

---

### 🐳 Docker (Full Stack)

```bash
cd url/backend/docker
docker-compose up --build
```

Starts PostgreSQL + Django with Gunicorn. Migrations run automatically on startup.

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint              | Description             | Auth |
| ------ | --------------------- | ----------------------- | ---- |
| `POST` | `/api/auth/register/` | Create a new account    | ❌   |
| `POST` | `/api/auth/login/`    | Obtain JWT tokens       | ❌   |
| `POST` | `/api/auth/logout/`   | Blacklist refresh token | ✅   |

### URL Management

| Method   | Endpoint                    | Description                | Auth |
| -------- | --------------------------- | -------------------------- | ---- |
| `GET`    | `/api/urls/`                | List user's shortened URLs | ✅   |
| `POST`   | `/api/urls/`                | Create a new short URL     | ✅   |
| `PATCH`  | `/api/urls/{id}/`           | Update a short URL         | ✅   |
| `DELETE` | `/api/urls/{id}/`           | Delete a short URL         | ✅   |
| `GET`    | `/api/urls/{id}/analytics/` | Get click analytics        | ✅   |
| `GET`    | `/api/urls/{id}/qr/`        | Download QR code (PNG)     | ✅   |

### Redirect

| Method | Endpoint        | Description              | Auth |
| ------ | --------------- | ------------------------ | ---- |
| `GET`  | `/{short_key}/` | Redirect to original URL | ❌   |

---

## 📸 Pages & Features

| Page             | Route                 | Description                                   |
| ---------------- | --------------------- | --------------------------------------------- |
| 🏠 **Landing**   | `/`                   | Marketing page with feature highlights        |
| 🔑 **Login**     | `/login`              | JWT login with animated transitions           |
| 📝 **Register**  | `/register`           | Account creation with Zod validation          |
| 📊 **Dashboard** | `/dashboard`          | View, create, edit, and delete shortened URLs |
| 📈 **Analytics** | `/urls/:id/analytics` | Click charts and referrer breakdown           |
| 📱 **QR Code**   | `/urls/:id/qr`        | View and download QR codes                    |
| 👤 **Profile**   | `/profile`            | User profile management                       |

---

## ⚙️ Environment Variables

| Variable                            | Description                          | Default                       |
| ----------------------------------- | ------------------------------------ | ----------------------------- |
| `DJANGO_SETTINGS_MODULE`            | Settings module path                 | `config.settings.development` |
| `SECRET_KEY`                        | Django secret key                    | _required_                    |
| `DEBUG`                             | Debug mode                           | `True`                        |
| `ALLOWED_HOSTS`                     | Comma-separated allowed hosts        | `localhost,127.0.0.1`         |
| `DB_NAME`                           | PostgreSQL database name             | `url_shortener`               |
| `DB_USER`                           | PostgreSQL user                      | `postgres`                    |
| `DB_PASSWORD`                       | PostgreSQL password                  | _required in prod_            |
| `DB_HOST`                           | PostgreSQL host                      | `localhost`                   |
| `DB_PORT`                           | PostgreSQL port                      | `5432`                        |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token TTL in minutes          | `60`                          |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS`   | Refresh token TTL in days            | `7`                           |
| `SHORT_URL_BASE`                    | Base domain for generated short URLs | `http://localhost:8000`       |

---

## 🧪 Running Tests

```bash
# Run all tests
cd url/backend
python manage.py test

# Run tests for a specific app
python manage.py test apps.authentication
python manage.py test apps.shortener
python manage.py test apps.common
```

---

## 🏛️ Architecture & Design Decisions

- **Service-Layer Pattern** — All write operations go through `services.py`, keeping views thin and logic testable.
- **Selectors** — All read queries go through `selectors.py` with optimized QuerySets for performance.
- **Custom User Model** — Implemented from day one to avoid painful migration issues later.
- **Atomic Click Counting** — Uses Django's `F('click_count') + 1` with `select_for_update()` to prevent race conditions.
- **Base62 Key Generation** — Collision-safe short key generation with configurable retry limits.
- **Centralized Error Handling** — Consistent `{"error", "code"}` response envelope across the entire API.
- **Split Settings** — Separate `base.py`, `development.py` (SQLite), and `production.py` (PostgreSQL + hardened security) configurations.
- **Zustand State Management** — Lightweight, scalable state management on the frontend with no boilerplate.
- **Zod Validation** — End-to-end type-safe form validation shared between components.

---

## 📄 License

MIT

---

<p align="center">
  Built with ❤️ by <strong>Santosh</strong>
</p>
