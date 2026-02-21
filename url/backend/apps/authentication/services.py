"""
Authentication service layer.

All authentication business logic lives here — views call these
functions, never the ORM directly.
"""

from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from core.logging import auth_logger as logger

User = get_user_model()


def register_user(*, username: str, email: str, password: str) -> User:
    """
    Create a new user account.

    Returns the created ``User`` instance.
    """
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )
    logger.info("User registered: %s", email)
    return user


def login_user(*, email: str, password: str) -> dict | None:
    """
    Authenticate and return JWT tokens.

    Returns a dict with ``access``, ``refresh``, and ``user`` keys,
    or ``None`` if credentials are invalid.
    """
    user = authenticate(username=email, password=password)
    if user is None:
        logger.warning("Failed login attempt for email: %s", email)
        return None

    refresh = RefreshToken.for_user(user)
    logger.info("User logged in: %s", email)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": user,
    }


def logout_user(*, refresh_token: str) -> bool:
    """
    Blacklist the refresh token to log out.

    Returns ``True`` on success, ``False`` if the token is invalid.
    """
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        logger.info("User logged out (token blacklisted).")
        return True
    except Exception:
        logger.warning("Logout failed — invalid refresh token.")
        return False
