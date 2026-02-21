"""
Structured logging helpers for the URL shortener project.

Provides convenience loggers for specific subsystems so that
log messages are consistently prefixed and easy to filter.
"""

import logging


def get_logger(name: str) -> logging.Logger:
    """
    Return a logger under the ``apps`` namespace.

    Usage::

        from core.logging import get_logger
        logger = get_logger(__name__)
        logger.info("Something happened")
    """
    return logging.getLogger(f"apps.{name}")


# Pre-built loggers for common subsystems
auth_logger = get_logger("authentication")
shortener_logger = get_logger("shortener")
users_logger = get_logger("users")
