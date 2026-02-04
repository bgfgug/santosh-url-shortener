from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Standardizes error responses across the entire API.
    Separates 'application_error' (validation/logical errors) from 'system_error' (unexpected/500s).
    """
    # Call DRF's default exception handler first to get the standard error response.
    response = exception_handler(exc, context)

    # If DRF handled it (4xx errors)
    if response is not None:
        # Standardize the payload
        response.data = {
            'type': 'application_error',
            'status_code': response.status_code,
            'errors': response.data
        }
        return response

    # If response is None, it's an unhandled exception (System Error / 500)
    # This might include database failures, attribute errors, etc.
    
    # Extract request info for logging
    request = context.get('request')
    path = request.path if request else 'unknown'
    method = request.method if request else 'unknown'
    
    logger.error(f"System Error on {method} {path}: {str(exc)}", exc_info=True)

    # Return a sanitized response to the user
    return Response({
        'type': 'system_error',
        'status_code': 500,
        'message': 'An internal system error occurred. We have been notified and are looking into it.',
        'error_code': 'INTERNAL_SERVER_ERROR'
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)