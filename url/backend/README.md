# URL Shortener — Django REST Framework

A production-ready URL shortener built with **Django 4+**, **Django REST Framework**, and **JWT authentication**. Follows service-layer architecture with clean separation of concerns.

---

## Architecture

```
View → Serializer (validation) → Service (business logic) → Model
View → Selector (read queries) → Optimized QuerySet → Response
```

| Layer           | Responsibility                                  |
| --------------- | ----------------------------------------------- |
| **Views**       | Thin HTTP handlers — no business logic          |
| **Serializers** | Input validation and output transformation only |
| **Services**    | All write operations and business logic         |
| **Selectors**   | Read-only, optimised database queries           |
| **Models**      | Data structure and constraints                  |

---

## Folder Structure

```
url_shortener/
├── manage.py
├── .env.example
├── requirements.txt
├── config/
│   ├── urls.py
│   ├── asgi.py / wsgi.py
│   └── settings/
│       ├── base.py
│       ├── development.py
│       └── production.py
├── apps/
│   ├── common/          # Shared utils, constants
│   ├── users/           # Custom User model
│   ├── authentication/  # JWT register/login/logout
│   └── shortener/       # Core domain
├── core/
│   ├── exceptions.py    # Centralized error handling
│   ├── logging.py       # Structured logging helpers
│   ├── middleware.py     # Request logging
│   └── throttling.py    # Rate limiting classes
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── templates/
├── static/
└── README.md
```

---

## 🚀 Quick Start (Local Development)

Follow these steps exactly to get the backend running on your local machine.

### 1. Prerequisites

- **Python 3.11+** installed.
- **pip** (Python package manager).
- **Git** (optional, for cloning).

### 2. Setup Virtual Environment

Isolating your dependencies is critical. Use a virtual environment:

```bash
# Clone and navigate
cd url_shortener

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Environment Configuration

The application uses an `.env` file for secrets and configuration.

```bash
# Copy the example file
copy .env.example .env     # Windows
# cp .env.example .env     # macOS/Linux
```

> [!IMPORTANT]
> Open `.env` and set a secure `SECRET_KEY`. For local development, `DEBUG=True` is the default in `development.py`.

### 5. Initialize Database (SQLite by default)

Run migrations in this specific order to ensure the custom user model is registered correctly:

```bash
# 1. Create migrations for apps
python manage.py makemigrations users
python manage.py makemigrations shortener

# 2. Apply all migrations
python manage.py migrate
```

### 6. Create Admin User

To access the Django Admin panel:

```bash
python manage.py createsuperuser
```

### 7. Launch Server

```bash
python manage.py runserver
```

- **API Root:** [http://localhost:8000/api/](http://localhost:8000/api/)
- **Admin Panel:** [http://localhost:8000/admin/](http://localhost:8000/admin/)
- **Swagger UI:** [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) (if configured)

---

## Docker

```bash
cd docker
docker-compose up --build
```

This starts PostgreSQL and the Django app with Gunicorn.  
Runs migrations automatically on startup.

---

## API Endpoints

### Authentication

| Method | Endpoint              | Description             | Auth |
| ------ | --------------------- | ----------------------- | ---- |
| POST   | `/api/auth/register/` | Create account          | No   |
| POST   | `/api/auth/login/`    | Get JWT tokens          | No   |
| POST   | `/api/auth/logout/`   | Blacklist refresh token | Yes  |

### Short URLs

| Method | Endpoint                    | Description      | Auth |
| ------ | --------------------------- | ---------------- | ---- |
| GET    | `/api/urls/`                | List user's URLs | Yes  |
| POST   | `/api/urls/`                | Create short URL | Yes  |
| PATCH  | `/api/urls/{id}/`           | Update short URL | Yes  |
| DELETE | `/api/urls/{id}/`           | Delete short URL | Yes  |
| GET    | `/api/urls/{id}/analytics/` | Click analytics  | Yes  |
| GET    | `/api/urls/{id}/qr/`        | QR code (PNG)    | Yes  |

### Redirect

| Method | Endpoint        | Description              | Auth |
| ------ | --------------- | ------------------------ | ---- |
| GET    | `/{short_key}/` | Redirect to original URL | No   |

---

## Example cURL Requests

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"Demo1234!","password_confirm":"Demo1234!"}'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo1234!"}'
```

### Create Short URL

```bash
curl -X POST http://localhost:8000/api/urls/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"original_url":"https://www.example.com/very/long/path"}'
```

### Create with Custom Key

```bash
curl -X POST http://localhost:8000/api/urls/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"original_url":"https://www.example.com","custom_key":"mylink"}'
```

### List URLs

```bash
curl http://localhost:8000/api/urls/ \
  -H "Authorization: Bearer <access_token>"
```

### Analytics

```bash
curl http://localhost:8000/api/urls/<uuid>/analytics/ \
  -H "Authorization: Bearer <access_token>"
```

### Redirect

```bash
curl -L http://localhost:8000/mylink/
```

---

## Environment Variables

| Variable                            | Description                | Default                 |
| ----------------------------------- | -------------------------- | ----------------------- |
| `SECRET_KEY`                        | Django secret key          | _required_              |
| `DEBUG`                             | Debug mode                 | `False`                 |
| `ALLOWED_HOSTS`                     | Comma-separated hosts      | `""`                    |
| `DB_NAME`                           | PostgreSQL database name   | `url_shortener`         |
| `DB_USER`                           | PostgreSQL user            | `postgres`              |
| `DB_PASSWORD`                       | PostgreSQL password        | _required in prod_      |
| `DB_HOST`                           | PostgreSQL host            | `localhost`             |
| `DB_PORT`                           | PostgreSQL port            | `5432`                  |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token TTL           | `60`                    |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS`   | Refresh token TTL          | `7`                     |
| `SHORT_URL_BASE`                    | Base domain for short URLs | `http://localhost:8000` |

---

## Running Tests

```bash
python manage.py test
```

Or run a specific app's tests:

```bash
python manage.py test apps.common
python manage.py test apps.authentication
python manage.py test apps.shortener
```

---

## Key Design Decisions

- **Custom User model** from day one — avoids painful migration later.
- **Service layer** — all writes go through `services.py`, never directly from views.
- **Selectors** — all reads go through `selectors.py` with optimised QuerySets.
- **Atomic click counting** — uses `F('click_count') + 1` and `select_for_update` to prevent race conditions.
- **Base62 key generation** — collision-safe with configurable retry limit.
- **Centralized exceptions** — consistent `{"error", "code"}` envelope across the entire API.
- **Split settings** — `base.py`, `development.py` (SQLite), `production.py` (PostgreSQL + hardened security).

---

## License

MIT
