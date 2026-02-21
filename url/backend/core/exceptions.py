"""
Centralized exception handling for the URL shortener project.

Provides a custom DRF exception handler that returns a consistent error
format: {"error": "message", "code": "ERROR_CODE"}
"""

import logging

from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied as DRFPermissionDenied,
    ValidationError as DRFValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Custom exception classes
# ---------------------------------------------------------------------------

class URLExpired(APIException):
    """Raised when a shortened URL has expired."""
    status_code = status.HTTP_410_GONE
    default_detail = "This shortened URL has expired."
    default_code = "URL_EXPIRED"


class ShortKeyCollision(APIException):
    """Raised when a short key collision cannot be resolved after retries."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "Unable to generate a unique short key. Please try again."
    default_code = "KEY_COLLISION"


class CustomKeyTaken(APIException):
    """Raised when a requested custom key is already in use."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "The requested custom key is already taken."
    default_code = "CUSTOM_KEY_TAKEN"


# ---------------------------------------------------------------------------
# Custom exception handler
# ---------------------------------------------------------------------------

def _format_error(message: str, code: str) -> dict:
    """Return the standard error envelope."""
    return {"error": message, "code": code}


def _flatten_validation_errors(detail) -> str:
    """Flatten DRF validation detail into a single human-readable string."""
    if isinstance(detail, list):
        return " ".join(str(item) for item in detail)
    if isinstance(detail, dict):
        parts = []
        for field, errors in detail.items():
            if isinstance(errors, list):
                msg = ", ".join(str(e) for e in errors)
            else:
                msg = str(errors)
            parts.append(f"{field}: {msg}")
        return "; ".join(parts)
    return str(detail)


def custom_exception_handler(exc, context):
    """
    Global exception handler registered in DRF settings.

    Converts all exceptions into the standard envelope:
        {"error": "<message>", "code": "<CODE>"}
    """

    # Let DRF handle its own exceptions first to get headers, status, etc.
    response = exception_handler(exc, context)

    # --- Django-native exceptions that DRF does not catch ---
    if isinstance(exc, Http404):
        return Response(
            _format_error("Not found.", "NOT_FOUND"),
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, PermissionDenied):
        return Response(
            _format_error("Permission denied.", "PERMISSION_DENIED"),
            status=status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, DjangoValidationError):
        return Response(
            _format_error("; ".join(exc.messages), "VALIDATION_ERROR"),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --- DRF exceptions (response was already built above) ---
    if response is not None:
        if isinstance(exc, DRFValidationError):
            message = _flatten_validation_errors(exc.detail)
            code = "VALIDATION_ERROR"
        elif isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
            message = str(exc.detail)
            code = "AUTHENTICATION_ERROR"
        elif isinstance(exc, DRFPermissionDenied):
            message = str(exc.detail)
            code = "PERMISSION_DENIED"
        elif isinstance(exc, APIException):
            message = str(exc.detail)
            code = getattr(exc, "default_code", "ERROR")
        else:
            message = "An error occurred."
            code = "ERROR"

        response.data = _format_error(message, code)
        return response

    # --- Truly unexpected exceptions ---
    logger.exception("Unhandled exception: %s", exc)
    return Response(
        _format_error("An unexpected error occurred.", "INTERNAL_ERROR"),
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
