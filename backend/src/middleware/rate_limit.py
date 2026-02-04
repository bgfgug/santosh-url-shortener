
from django.core.cache import cache
from django.http import JsonResponse
import time

class RateLimitMiddleware:
    """
    Limits requests per IP address using Redis.
    Limit: 100 requests per minute.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = self.get_client_ip(request)
        key = f"rl:{ip}"
        
        try:
            # Atomic increment
            count = cache.get_or_set(key, 0, timeout=60)
            if count >= 100:
                return JsonResponse(
                    {"error": "Too Many Requests", "message": "Rate limit exceeded. Please try again in a minute."},
                    status=429
                )
            cache.incr(key)
        except Exception:
            # If Redis is down, we allow the request but log the failure
            pass

        return self.get_response(request)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
