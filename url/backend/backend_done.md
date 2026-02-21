# Backend Implementation — Complete Reference

> Every detail of the Django URL Shortener backend, documented from the actual source code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Pattern](#2-architecture-pattern)
3. [Django Apps](#3-django-apps)
4. [Built-in Django Features Used](#4-built-in-django-features-used)
5. [Error Handling System](#5-error-handling-system)
6. [Logging Configuration](#6-logging-configuration)
7. [Development Configuration](#7-development-configuration)
8. [Production Configuration](#8-production-configuration)
9. [API Contract](#9-api-contract)
10. [Constants & Utilities](#10-constants--utilities)

---

## 1. Project Overview

| Detail              | Value                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Framework**       | Django 4.2+ with Django REST Framework 3.14+                                                               |
| **Authentication**  | JWT via `djangorestframework-simplejwt` 5.3+                                                               |
| **Database (Dev)**  | SQLite (`db.sqlite3`)                                                                                      |
| **Database (Prod)** | PostgreSQL via `psycopg2-binary` 2.9+                                                                      |
| **CORS**            | `django-cors-headers` 4.3+                                                                                 |
| **QR Codes**        | `qrcode[pil]` 7.4+                                                                                         |
| **WSGI Server**     | Gunicorn 21.2+                                                                                             |
| **Env Config**      | `python-decouple` 3.8+                                                                                     |
| **Testing**         | `factory-boy` 3.3+, `faker` 20.0+                                                                          |
| **User Model**      | Custom (`apps.users.User`), email-based auth                                                               |
| **Settings Module** | `DJANGO_SETTINGS_MODULE` env var pointing to `config.settings.development` or `config.settings.production` |

### Folder Structure

```
url_shortener/
├── manage.py
├── .env / .env.example
├── requirements.txt
├── config/
│   ├── urls.py                    # Root URL configuration
│   ├── asgi.py / wsgi.py
│   └── settings/
│       ├── __init__.py
│       ├── base.py                # Shared settings
│       ├── development.py         # Dev overrides (SQLite, DEBUG=True)
│       └── production.py          # Prod overrides (PostgreSQL, security)
├── apps/
│   ├── common/                    # Shared utilities & constants
│   │   ├── constants.py
│   │   └── utils.py
│   ├── users/                     # Custom User model
│   │   ├── models.py
│   │   └── admin.py
│   ├── authentication/            # JWT register / login / logout
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── services.py
│   │   ├── urls.py
│   │   └── tests.py
│   └── shortener/                 # Core URL shortening domain
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       ├── services.py
│       ├── selectors.py
│       ├── urls.py
│       ├── redirect_urls.py
│       ├── admin.py
│       └── tests.py
├── core/
│   ├── exceptions.py              # Centralized error handling
│   ├── logging.py                 # Structured logging helpers
│   ├── middleware.py              # Request logging middleware
│   └── throttling.py             # Rate limiting classes
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── templates/
└── static/
```

---

## 2. Architecture Pattern

### Service-Layer Architecture

The project follows a strict **Service-Layer** pattern with a clear separation of concerns:

```
Request → View → Serializer (validation) → Service (business logic) → Model
Request → View → Selector (read queries) → Optimised QuerySet → Response
```

| Layer           | Responsibility                                                                   |
| --------------- | -------------------------------------------------------------------------------- |
| **Views**       | Thin HTTP handlers — parse request, call service/selector, return response       |
| **Serializers** | Input validation and output transformation **only** — zero business logic        |
| **Services**    | All **write operations** and business logic — views never touch the ORM directly |
| **Selectors**   | All **read-only** database queries — optimised QuerySets for listing/analytics   |
| **Models**      | Data structure, constraints, and database schema                                 |

### Why This Matters

- Views remain thin and testable
- Business logic is reusable (can be called from management commands, Celery tasks, etc.)
- Read and write paths are separated, making future optimisation (caching, read replicas) trivial

---

## 3. Django Apps

### 3.1 `apps.users` — Custom User Model

**File: `apps/users/models.py`**

```python
class User(AbstractUser):
    email = models.EmailField("email address", unique=True)
    USERNAME_FIELD = "email"          # Login with email, not username
    REQUIRED_FIELDS = ["username"]    # Still collected at registration
```

| Decision                    | Detail                                                                |
| --------------------------- | --------------------------------------------------------------------- |
| Extends `AbstractUser`      | Gets all Django auth features (password hashing, permissions, groups) |
| `USERNAME_FIELD = "email"`  | `authenticate()` uses email instead of username                       |
| Custom `db_table = "users"` | Clean table name                                                      |
| Ordering by `-date_joined`  | Newest users first by default                                         |
| Created **from day one**    | Avoids the painful mid-project migration away from `auth.User`        |

**File: `apps/users/admin.py`**

- Extends `BaseUserAdmin`
- `list_display`: email, username, is_staff, is_active, date_joined
- `search_fields`: email, username
- `ordering`: `-date_joined`

---

### 3.2 `apps.authentication` — JWT Authentication

**File: `apps/authentication/serializers.py`**

| Serializer           | Fields                                      | Validations                                                      |
| -------------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| `RegisterSerializer` | username, email, password, password_confirm | Email uniqueness, username uniqueness, password match            |
| `LoginSerializer`    | email, password                             | Basic field presence                                             |
| `UserSerializer`     | id, username, email, date_joined            | Read-only `ModelSerializer` — used in register & login responses |

**File: `apps/authentication/services.py`**

| Function        | What It Does                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| `register_user` | Calls `User.objects.create_user()` → logs registration → returns `User`                                    |
| `login_user`    | Calls `authenticate()` → generates `RefreshToken.for_user()` → returns `{access, refresh, user}` or `None` |
| `logout_user`   | Accepts refresh token → calls `token.blacklist()` → returns `True/False`                                   |

**File: `apps/authentication/views.py`**

| View           | Endpoint                   | Auth | Logic                                                         |
| -------------- | -------------------------- | ---- | ------------------------------------------------------------- |
| `RegisterView` | `POST /api/auth/register/` | No   | Validate → `services.register_user()` → 201 with user data    |
| `LoginView`    | `POST /api/auth/login/`    | No   | Validate → `services.login_user()` → 200 with tokens or 401   |
| `LogoutView`   | `POST /api/auth/logout/`   | Yes  | Extract refresh token → `services.logout_user()` → 200 or 400 |

**URL Config: `apps/authentication/urls.py`**

```python
path("register/", RegisterView.as_view(), name="auth-register")
path("login/",    LoginView.as_view(),    name="auth-login")
path("logout/",   LogoutView.as_view(),   name="auth-logout")
```

---

### 3.3 `apps.shortener` — URL Shortening Domain

#### Models — `apps/shortener/models.py`

**`ShortURL` Model**

| Field          | Type                        | Notes                                            |
| -------------- | --------------------------- | ------------------------------------------------ |
| `id`           | `UUIDField` (PK)            | Auto-generated `uuid4`, not editable             |
| `user`         | `ForeignKey → User`         | `on_delete=CASCADE`, `related_name="short_urls"` |
| `original_url` | `URLField(max_length=2048)` | The destination URL                              |
| `short_key`    | `CharField(max_length=20)`  | Unique, indexed — the short path slug            |
| `custom_key`   | `CharField(max_length=20)`  | Optional custom alias, nullable                  |
| `click_count`  | `PositiveIntegerField`      | Tracks total clicks (atomic increment via `F()`) |
| `expires_at`   | `DateTimeField`             | Optional expiration timestamp                    |
| `created_at`   | `DateTimeField`             | Auto-set on creation                             |
| `updated_at`   | `DateTimeField`             | Auto-set on every save                           |

- **Table**: `short_urls`
- **Ordering**: `-created_at` (newest first)
- **Composite Index**: `(user, created_at)` for efficient user-scoped listing

**`ClickEvent` Model**

| Field        | Type                    | Notes                                              |
| ------------ | ----------------------- | -------------------------------------------------- |
| `id`         | `BigAutoField` (PK)     | High-volume table, uses 64-bit auto-increment      |
| `short_url`  | `ForeignKey → ShortURL` | `on_delete=CASCADE`, `related_name="click_events"` |
| `ip_address` | `GenericIPAddressField` | Supports both IPv4 and IPv6                        |
| `user_agent` | `TextField`             | Browser/client user agent string                   |
| `created_at` | `DateTimeField`         | Auto-set on creation                               |

- **Table**: `click_events`
- **Ordering**: `-created_at`

---

#### Serializers — `apps/shortener/serializers.py`

| Serializer                   | Purpose                                 | Validations                                                        |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| `ShortURLCreateSerializer`   | Validate input for creating a short URL | Custom key: alphanumeric only, ≥3 chars. Expiry: must be in future |
| `ShortURLUpdateSerializer`   | Validate input for updating a short URL | Expiry: must be in future                                          |
| `ShortURLResponseSerializer` | Read-only output representation         | Includes computed `short_url` field via `build_short_url()`        |
| `ClickEventSerializer`       | Read-only click event representation    | Fields: id, ip_address, user_agent, created_at                     |
| `AnalyticsSerializer`        | Analytics response                      | Nests `ShortURLResponseSerializer` + click_count + recent_clicks   |

---

#### Services — `apps/shortener/services.py`

| Function            | Operation    | Key Details                                                                                                                                                                                                                                                                                        |
| ------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_short_url`  | **Create**   | If `custom_key` provided → check uniqueness (raise `CustomKeyTaken`). Otherwise → generate collision-safe Base62 key. Creates `ShortURL` record.                                                                                                                                                   |
| `update_short_url`  | **Update**   | Accepts optional `original_url`, `expires_at`, `clear_expiry`. Uses `save(update_fields=[...])` for efficiency.                                                                                                                                                                                    |
| `delete_short_url`  | **Delete**   | Deletes the `ShortURL` (cascade deletes related `ClickEvent` records).                                                                                                                                                                                                                             |
| `resolve_and_track` | **Redirect** | The **hot path**. Wrapped in `@transaction.atomic`. Uses `select_for_update()` for row-level locking. Checks expiration (raises `URLExpired` → HTTP 410). Atomically increments `click_count` via `F('click_count') + 1`. Records a `ClickEvent` with IP and user agent. Returns the original URL. |

---

#### Selectors — `apps/shortener/selectors.py`

| Function              | What It Returns                                                   |
| --------------------- | ----------------------------------------------------------------- |
| `get_user_short_urls` | All `ShortURL`s for a user, ordered by `-created_at`              |
| `get_short_url_by_id` | Single `ShortURL` owned by a user, or `None`                      |
| `get_analytics`       | Dict with `short_url`, `click_count`, and last 50 `recent_clicks` |

---

#### Views — `apps/shortener/views.py`

| View                     | Endpoints                       | Auth | Methods           |
| ------------------------ | ------------------------------- | ---- | ----------------- |
| `ShortURLListCreateView` | `GET/POST /api/urls/`           | Yes  | List + Create     |
| `ShortURLDetailView`     | `PATCH/DELETE /api/urls/{id}/`  | Yes  | Update + Delete   |
| `ShortURLAnalyticsView`  | `GET /api/urls/{id}/analytics/` | Yes  | Read analytics    |
| `ShortURLQRCodeView`     | `GET /api/urls/{id}/qr/`        | Yes  | Returns PNG image |
| `RedirectView`           | `GET /{short_key}/`             | No   | 301 redirect      |

> `RedirectView` skips JWT lookup (`authentication_classes = []`) and throttling (`throttle_classes = []`) for maximum speed.

---

#### Admin — `apps/shortener/admin.py`

- **`ShortURLAdmin`**: Displays short_key, original_url, user, click_count, expires_at, created_at. Filterable by created_at and expires_at. Searchable by short_key, original_url, user email. Has `ClickEventInline` for viewing click events inline.
- **`ClickEventAdmin`**: Displays short_url, ip_address, created_at. Filterable and searchable.

---

### 3.4 `apps.common` — Shared Utilities & Constants

#### Constants — `apps/common/constants.py`

| Constant                  | Value                       | Used By                                     |
| ------------------------- | --------------------------- | ------------------------------------------- |
| `BASE62_ALPHABET`         | `0-9A-Za-z` (62 characters) | Short key generation                        |
| `SHORT_KEY_LENGTH`        | `7`                         | Default generated key length                |
| `SHORT_KEY_MAX_RETRIES`   | `5`                         | Max attempts before raising collision error |
| `SHORT_KEY_REGEX`         | `^[A-Za-z0-9]+$`            | Validates custom keys                       |
| `DEFAULT_PAGE_SIZE`       | `20`                        | Pagination default                          |
| `DEFAULT_EXPIRATION_DAYS` | `30`                        | Default URL expiration                      |
| `THROTTLE_ANON_BURST`     | `"anon_burst"`              | Throttle scope label                        |
| `THROTTLE_ANON_SUSTAINED` | `"anon_sustained"`          | Throttle scope label                        |
| `THROTTLE_USER_BURST`     | `"user_burst"`              | Throttle scope label                        |
| `THROTTLE_USER_SUSTAINED` | `"user_sustained"`          | Throttle scope label                        |
| `QR_BOX_SIZE`             | `10`                        | QR code pixel size                          |
| `QR_BORDER`               | `4`                         | QR code border width                        |

#### Utilities — `apps/common/utils.py`

| Function             | What It Does                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `base62_encode(n)`   | Encodes a non-negative integer into a Base62 string                                                                       |
| `base62_decode(s)`   | Decodes a Base62 string back to an integer                                                                                |
| `generate_short_key` | Generates a collision-safe short key: random → Base62 encode → check existence → retry if collision (up to `MAX_RETRIES`) |
| `get_client_ip`      | Extracts client IP from request, honoring `X-Forwarded-For` header for reverse proxies                                    |
| `generate_qr_code`   | Generates a PNG QR code as raw bytes using the `qrcode` library                                                           |
| `build_short_url`    | Joins `SHORT_URL_BASE` (from settings) with the short key                                                                 |

---

## 4. Built-in Django Features Used

### 4.1 Authentication & Authorization

| Feature                              | How It's Used                                                              |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `AbstractUser`                       | Extended for custom `User` model with `email` as the primary login field   |
| `AUTH_USER_MODEL = "users.User"`     | All `ForeignKey → User` references use the custom model                    |
| `django.contrib.auth.authenticate()` | Called in `login_user` service — handles password verification             |
| `User.objects.create_user()`         | Called in `register_user` service — handles password hashing automatically |
| `AUTH_PASSWORD_VALIDATORS`           | 4 built-in validators active: similarity, min length, common, numeric      |
| `IsAuthenticated` permission class   | Default for all DRF views; explicitly set `AllowAny` for public endpoints  |

### 4.2 Django Admin

| Feature                      | How It's Used                                                      |
| ---------------------------- | ------------------------------------------------------------------ |
| `admin.site.urls`            | Mounted at `/admin/`                                               |
| `@admin.register()`          | Decorator-style registration for `User`, `ShortURL`, `ClickEvent`  |
| `BaseUserAdmin`              | Extended for the custom user admin                                 |
| `TabularInline`              | `ClickEventInline` shows click events within `ShortURL` admin page |
| `list_display / list_filter` | Configured for all three models                                    |
| `search_fields`              | Full-text search across relevant fields                            |
| `readonly_fields`            | Protects auto-generated fields from manual editing                 |

### 4.3 ORM Features

| Feature                          | How It's Used                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `UUIDField(primary_key=True)`    | `ShortURL` uses UUID PKs instead of auto-increment                              |
| `BigAutoField(primary_key=True)` | `ClickEvent` uses 64-bit auto-increment for high-volume table                   |
| `GenericIPAddressField`          | Stores IPv4 and IPv6 addresses in `ClickEvent`                                  |
| `F('click_count') + 1`           | Atomic database-level increment — no race conditions                            |
| `select_for_update()`            | Row-level locking during redirect for concurrent safety                         |
| `@transaction.atomic`            | Wraps the redirect hot path (increment + click event creation)                  |
| `save(update_fields=[...])`      | Efficient partial updates — only touches specified columns                      |
| `Meta.indexes`                   | Composite index `(user, created_at)` on `ShortURL`                              |
| `Meta.db_table`                  | Custom table names: `users`, `short_urls`, `click_events`                       |
| `Meta.ordering`                  | Default ordering defined at model level                                         |
| `on_delete=CASCADE`              | Deleting a user cascades to their URLs; deleting a URL cascades to click events |
| `auto_now_add` / `auto_now`      | Automatic timestamp management on `created_at` / `updated_at`                   |

### 4.4 Middleware

| Feature                    | How It's Used                                                   |
| -------------------------- | --------------------------------------------------------------- |
| `SecurityMiddleware`       | Django built-in — enforces HTTPS, HSTS in production            |
| `SessionMiddleware`        | Django built-in — required by admin                             |
| `CommonMiddleware`         | Django built-in — URL normalization, content-length             |
| `CsrfViewMiddleware`       | Django built-in — CSRF protection for session-based forms       |
| `AuthenticationMiddleware` | Django built-in — attaches `request.user`                       |
| `MessageMiddleware`        | Django built-in — flash messages for admin                      |
| `XFrameOptionsMiddleware`  | Django built-in — clickjacking protection                       |
| `CorsMiddleware`           | Third-party (`django-cors-headers`) — handles CORS preflight    |
| `RequestLoggingMiddleware` | **Custom** — logs method, path, status code, response time (ms) |

### 4.5 URL Routing

| Feature                     | How It's Used                                                    |
| --------------------------- | ---------------------------------------------------------------- |
| `path()` with converters    | `<uuid:url_id>` for type-safe UUID extraction                    |
| `include()` with namespaces | `namespace="shortener-api"` and `namespace="shortener-redirect"` |
| `app_name`                  | Set per app for `reverse()` support                              |

### 4.6 Django REST Framework Features

| Feature                                 | How It's Used                                                                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `APIView`                               | All views extend `APIView` (class-based, explicit HTTP methods)                                                                          |
| `Serializer`                            | Plain serializers for input validation (`RegisterSerializer`, `LoginSerializer`, `ShortURLCreateSerializer`, `ShortURLUpdateSerializer`) |
| `ModelSerializer`                       | Output serializers (`UserSerializer`, `ShortURLResponseSerializer`, `ClickEventSerializer`)                                              |
| `SerializerMethodField`                 | Computed `short_url` field in `ShortURLResponseSerializer`                                                                               |
| `JWTAuthentication`                     | Default auth class globally via `DEFAULT_AUTHENTICATION_CLASSES`                                                                         |
| `PageNumberPagination`                  | Default pagination with `PAGE_SIZE = 20`                                                                                                 |
| `raise_exception=True`                  | Serializer validation raises `ValidationError` automatically                                                                             |
| `JSONRenderer` / `BrowsableAPIRenderer` | JSON-only in prod, browsable API added in dev                                                                                            |
| Custom exception handler                | Registered via `EXCEPTION_HANDLER` setting                                                                                               |

### 4.7 SimpleJWT Features

| Feature                           | Configuration                                                          |
| --------------------------------- | ---------------------------------------------------------------------- |
| Access token lifetime             | Configurable via `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` (default: 60 min) |
| Refresh token lifetime            | Configurable via `JWT_REFRESH_TOKEN_LIFETIME_DAYS` (default: 7 days)   |
| `ROTATE_REFRESH_TOKENS = True`    | Every refresh gives a new refresh token                                |
| `BLACKLIST_AFTER_ROTATION = True` | Old refresh tokens are blacklisted after rotation                      |
| Token blacklist app installed     | `rest_framework_simplejwt.token_blacklist` in `INSTALLED_APPS`         |
| `AUTH_HEADER_TYPES = ("Bearer",)` | Standard Bearer token format                                           |

### 4.8 Other Django Built-ins

| Feature                                           | How It's Used                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `python-decouple` + `config()`                    | All secrets and env-specific values read from `.env`              |
| `Csv()` cast                                      | Parses comma-separated `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` |
| Split settings (`base → dev/prod`)                | Clean environment separation                                      |
| `STATIC_URL` / `STATIC_ROOT` / `STATICFILES_DIRS` | Static file handling for admin and future frontend                |
| `TEMPLATES` with `APP_DIRS = True`                | Template discovery for admin and future templates                 |
| `DEFAULT_AUTO_FIELD = BigAutoField`               | 64-bit auto-increment as the project-wide default PK              |

---

## 5. Error Handling System

### Location: `core/exceptions.py`

The project implements a **centralized, consistent error handling system** registered as the global DRF exception handler.

### 5.1 Standard Error Envelope

Every error response follows this format:

```json
{
  "error": "Human-readable error message.",
  "code": "MACHINE_READABLE_CODE"
}
```

### 5.2 Custom Exception Classes

| Exception           | HTTP Status | Code               | When It's Raised                                   |
| ------------------- | ----------- | ------------------ | -------------------------------------------------- |
| `URLExpired`        | `410 Gone`  | `URL_EXPIRED`      | When a user tries to access an expired short URL   |
| `ShortKeyCollision` | `500`       | `KEY_COLLISION`    | When Base62 key generation fails after all retries |
| `CustomKeyTaken`    | `400`       | `CUSTOM_KEY_TAKEN` | When a custom alias is already in use              |

All three extend DRF's `APIException` — they are automatically caught by the framework.

### 5.3 Exception Handler Flow

```
custom_exception_handler(exc, context)
│
├─ Django Http404         → {"error": "Not found.", "code": "NOT_FOUND"}                           → 404
├─ Django PermissionDenied → {"error": "Permission denied.", "code": "PERMISSION_DENIED"}          → 403
├─ Django ValidationError → {"error": "<joined messages>", "code": "VALIDATION_ERROR"}             → 400
│
├─ DRF ValidationError    → {"error": "<flattened field errors>", "code": "VALIDATION_ERROR"}      → 400
├─ DRF NotAuthenticated   → {"error": "<detail>", "code": "AUTHENTICATION_ERROR"}                  → 401
├─ DRF AuthenticationFailed → {"error": "<detail>", "code": "AUTHENTICATION_ERROR"}                → 401
├─ DRF PermissionDenied   → {"error": "<detail>", "code": "PERMISSION_DENIED"}                     → 403
├─ Any other APIException → {"error": "<detail>", "code": "<default_code>"}                        → varies
│
└─ Unhandled exception    → {"error": "An unexpected error occurred.", "code": "INTERNAL_ERROR"}    → 500
                            (also logged via logger.exception)
```

### 5.4 Validation Error Flattening

DRF validation errors can be deeply nested. The `_flatten_validation_errors()` helper converts them to a single human-readable string:

```python
# Input:  {"email": ["This field is required."], "password": ["Too short.", "Too common."]}
# Output: "email: This field is required.; password: Too short., Too common."
```

### 5.5 View-Level Error Handling

In addition to the global handler, views also return structured errors directly:

| Scenario                              | Response                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------- |
| URL not found (selector returns None) | `{"error": "Not found.", "code": "NOT_FOUND"}` — 404                        |
| Invalid credentials (login)           | `{"error": "Invalid credentials.", "code": "INVALID_CREDENTIALS"}` — 401    |
| Missing refresh token (logout)        | `{"error": "Refresh token is required.", "code": "VALIDATION_ERROR"}` — 400 |
| Invalid refresh token (logout)        | `{"error": "Invalid or expired token.", "code": "INVALID_TOKEN"}` — 400     |
| Short URL not found (redirect)        | `{"error": "Short URL not found.", "code": "NOT_FOUND"}` — 404              |

---

## 6. Logging Configuration

### 6.1 Structured Logger Helpers — `core/logging.py`

The project provides a centralized logging module that creates **namespaced loggers** under the `apps.*` prefix:

```python
def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"apps.{name}")

# Pre-built loggers for each subsystem:
auth_logger      = get_logger("authentication")   # → apps.authentication
shortener_logger = get_logger("shortener")         # → apps.shortener
users_logger     = get_logger("users")             # → apps.users
```

### 6.2 What Gets Logged

| Subsystem          | Events Logged                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Authentication** | User registered, user logged in, failed login attempt, logout success/failure                                         |
| **Shortener**      | URL created (with key, original URL, user ID), URL updated, URL deleted, redirect (key → URL), key generation failure |
| **Middleware**     | Every HTTP request: method, full path, status code, response time in ms                                               |
| **Exceptions**     | Unhandled exceptions (via `logger.exception`)                                                                         |

### 6.3 Log Levels Used

| Level       | When                                                             |
| ----------- | ---------------------------------------------------------------- |
| `INFO`      | Successful operations (registration, login, URL CRUD, redirects) |
| `WARNING`   | Failed login attempts, invalid logout tokens                     |
| `ERROR`     | Short key generation failures                                    |
| `EXCEPTION` | Truly unhandled exceptions in the global error handler           |

### 6.4 Request Logging Middleware — `core/middleware.py`

Every request is logged with:

```
GET /api/urls/ 200 12.45ms
POST /api/auth/login/ 401 3.21ms
```

Uses `time.monotonic()` for reliable duration measurement regardless of system clock changes.

### 6.5 Production Logging Configuration

Defined in `config/settings/production.py` — see [Section 8](#8-production-configuration) for full details.

---

## 7. Development Configuration

### Location: `config/settings/development.py`

Extends `base.py` with the following overrides:

### 7.1 Debug Mode

```python
DEBUG = True
```

Enables:

- Detailed error pages with stack traces
- Django Debug Toolbar support (if installed)
- Template debug information

### 7.2 Database — SQLite

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

- **Zero setup** — no external database service needed
- Single file (`db.sqlite3`) at the project root
- Perfect for local development and testing

### 7.3 CORS — Allow All Origins

```python
CORS_ALLOW_ALL_ORIGINS = True
```

- No origin restrictions during development
- Any frontend (on any port) can call the API
- Overrides the `CORS_ALLOWED_ORIGINS` list from `base.py`

### 7.4 Browsable API

```python
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",       # Added for dev
)
```

- Adds DRF's interactive Browsable API at every endpoint
- Lets you test endpoints directly in the browser with forms
- Production only uses `JSONRenderer`

### 7.5 Console Email Backend

```python
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
```

- Prints emails to the terminal instead of sending them
- Useful for development and testing

### 7.6 What Development Inherits from Base

Everything in `base.py` applies unless overridden:

- All 4 throttle classes with their rates
- JWT configuration (60 min access, 7 day refresh, rotation, blacklisting)
- All middleware (including request logging)
- All installed apps
- Password validators
- `SHORT_URL_BASE = http://localhost:8000`
- `PAGE_SIZE = 20`
- Custom exception handler

---

## 8. Production Configuration

### Location: `config/settings/production.py`

Extends `base.py` with hardened security and PostgreSQL.

### 8.1 Debug Mode

```python
DEBUG = False
```

- No detailed error pages exposed to users
- Django does not serve static files — Gunicorn/Nginx handles this

### 8.2 Database — PostgreSQL

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="url_shortener"),
        "USER": config("DB_USER", default="postgres"),
        "PASSWORD": config("DB_PASSWORD"),                  # Required — no default
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
        "CONN_MAX_AGE": 600,                                # Persistent connections (10 min)
        "OPTIONS": {
            "connect_timeout": 10,                           # Fail fast on connection issues
        },
    }
}
```

| Setting           | Value | Purpose                                                                 |
| ----------------- | ----- | ----------------------------------------------------------------------- |
| `CONN_MAX_AGE`    | `600` | Reuses database connections for 10 minutes — avoids connection overhead |
| `connect_timeout` | `10`  | Fails fast if PostgreSQL is unreachable                                 |
| `DB_PASSWORD`     | —     | **Required** in production — no default value                           |

### 8.3 Security Headers

| Setting                          | Value      | What It Does                                                             |
| -------------------------------- | ---------- | ------------------------------------------------------------------------ |
| `SECURE_BROWSER_XSS_FILTER`      | `True`     | Sets `X-XSS-Protection: 1; mode=block` header                            |
| `SECURE_CONTENT_TYPE_NOSNIFF`    | `True`     | Sets `X-Content-Type-Options: nosniff` — prevents MIME sniffing          |
| `SECURE_SSL_REDIRECT`            | `True`\*   | Redirects all HTTP to HTTPS (\* configurable via env)                    |
| `SESSION_COOKIE_SECURE`          | `True`     | Session cookies only sent over HTTPS                                     |
| `CSRF_COOKIE_SECURE`             | `True`     | CSRF cookies only sent over HTTPS                                        |
| `X_FRAME_OPTIONS`                | `"DENY"`   | Prevents the site from being loaded in iframes — clickjacking protection |
| `SECURE_HSTS_SECONDS`            | `31536000` | HSTS header — forces HTTPS for 1 year                                    |
| `SECURE_HSTS_INCLUDE_SUBDOMAINS` | `True`     | HSTS applies to all subdomains                                           |
| `SECURE_HSTS_PRELOAD`            | `True`     | Allows inclusion in browser HSTS preload lists                           |

### 8.4 Production Logging

```python
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} {name} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "logs" / "production.log",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "WARNING",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "WARNING",
            "propagate": False,
        },
        "apps": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
```

| Logger     | Level     | Handlers       | What Gets Logged                                                            |
| ---------- | --------- | -------------- | --------------------------------------------------------------------------- |
| **root**   | `WARNING` | console + file | Anything WARNING or above from any unconfigured logger                      |
| **django** | `WARNING` | console + file | Django framework warnings and errors only                                   |
| **apps**   | `INFO`    | console + file | All application logs (auth, shortener, users, middleware) at INFO and above |

**Log format**: `2026-02-17 12:00:00 INFO apps.authentication services User registered: demo@example.com`

**Log file**: `url_shortener/logs/production.log`

---

## 9. API Contract

### 9.1 Root URL Configuration

```python
path("admin/",    admin.site.urls)
path("api/auth/", include("apps.authentication.urls"))
path("api/urls/", include("apps.shortener.urls", namespace="shortener-api"))
path("",          include("apps.shortener.redirect_urls", namespace="shortener-redirect"))
```

> The redirect route is **last** to avoid URL prefix collisions.

### 9.2 Complete Endpoint Reference

| Method | Endpoint                      | View                     | Auth | Request Body                                    | Success Response                                                                                                |
| ------ | ----------------------------- | ------------------------ | ---- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register/`         | `RegisterView`           | No   | `{username, email, password, password_confirm}` | 201 — `{message, user: {id, username, email, date_joined}}`                                                     |
| POST   | `/api/auth/login/`            | `LoginView`              | No   | `{email, password}`                             | 200 — `{access, refresh, user: {id, username, email, date_joined}}`                                             |
| POST   | `/api/auth/logout/`           | `LogoutView`             | Yes  | `{refresh}`                                     | 200 — `{message}`                                                                                               |
| GET    | `/api/urls/`                  | `ShortURLListCreateView` | Yes  | —                                               | 200 — `[{id, original_url, short_key, short_url, custom_key, click_count, expires_at, created_at, updated_at}]` |
| POST   | `/api/urls/`                  | `ShortURLListCreateView` | Yes  | `{original_url, custom_key?, expires_at?}`      | 201 — ShortURL object                                                                                           |
| PATCH  | `/api/urls/{uuid}/`           | `ShortURLDetailView`     | Yes  | `{original_url?, expires_at?}`                  | 200 — Updated ShortURL object                                                                                   |
| DELETE | `/api/urls/{uuid}/`           | `ShortURLDetailView`     | Yes  | —                                               | 204 — No content                                                                                                |
| GET    | `/api/urls/{uuid}/analytics/` | `ShortURLAnalyticsView`  | Yes  | —                                               | 200 — `{short_url: {...}, click_count, recent_clicks: [...]}`                                                   |
| GET    | `/api/urls/{uuid}/qr/`        | `ShortURLQRCodeView`     | Yes  | —                                               | 200 — PNG image (`content-type: image/png`)                                                                     |
| GET    | `/{short_key}/`               | `RedirectView`           | No   | —                                               | 301 — `Location` header redirect                                                                                |

### 9.3 Rate Limiting

| Scope            | Rate      | Applies To            |
| ---------------- | --------- | --------------------- |
| `anon_burst`     | 10/minute | Unauthenticated users |
| `anon_sustained` | 100/day   | Unauthenticated users |
| `user_burst`     | 30/minute | Authenticated users   |
| `user_sustained` | 500/day   | Authenticated users   |

> Public redirects (`/{short_key}/`) have throttling **disabled** for performance.

---

## 10. Constants & Utilities

### 10.1 Environment Variables

| Variable                            | Required  | Default                         | Used In         |
| ----------------------------------- | --------- | ------------------------------- | --------------- |
| `DJANGO_SETTINGS_MODULE`            | Yes       | —                               | `.env`          |
| `SECRET_KEY`                        | Yes       | —                               | `base.py`       |
| `DEBUG`                             | No        | `False`                         | `base.py`       |
| `ALLOWED_HOSTS`                     | No        | `""` (empty)                    | `base.py`       |
| `DB_NAME`                           | No        | `url_shortener`                 | `production.py` |
| `DB_USER`                           | No        | `postgres`                      | `production.py` |
| `DB_PASSWORD`                       | **Yes\*** | —                               | `production.py` |
| `DB_HOST`                           | No        | `localhost`                     | `production.py` |
| `DB_PORT`                           | No        | `5432`                          | `production.py` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | No        | `60`                            | `base.py`       |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS`   | No        | `7`                             | `base.py`       |
| `CORS_ALLOWED_ORIGINS`              | No        | `localhost:3000,127.0.0.1:3000` | `base.py`       |
| `SHORT_URL_BASE`                    | No        | `http://localhost:8000`         | `base.py`       |
| `SECURE_SSL_REDIRECT`               | No        | `True`                          | `production.py` |

> \*`DB_PASSWORD` has no default — it will raise an error if not set in production.

### 10.2 Docker Support

- **`docker/Dockerfile`** — Builds the Django app image
- **`docker/docker-compose.yml`** — Starts PostgreSQL + Django with Gunicorn
- Runs migrations automatically on startup

---

> **This document reflects the actual, implemented source code as of the current codebase. No assumptions or planned features are included.**
