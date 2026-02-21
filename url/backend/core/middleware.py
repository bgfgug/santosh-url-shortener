"""
Custom middleware for the URL shortener project.
"""

import logging
import time

logger = logging.getLogger("apps.middleware")


class RequestLoggingMiddleware:
    """
    Logs method, path, status code, and response time for every request.

    Placed towards the end of the middleware stack so it wraps the full
    request/response cycle.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = (time.monotonic() - start) * 1000

        logger.info(
            "%s %s %s %.2fms",
            request.method,
            request.get_full_path(),
            response.status_code,
            duration_ms,
        )
        return response
