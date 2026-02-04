
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from .models import ShortLink
from src.apps.analytics.models import LinkClick
from django.db import transaction

class LinkService:
    CACHE_TTL = 86400  # 24 hours

    @staticmethod
    def get_destination_url(short_code):
        """
        Retrieves long URL with Cache-Aside pattern.
        """
        cache_key = f"url:{short_code}"
        
        # 1. Try Cache
        long_url = cache.get(cache_key)
        if long_url:
            return long_url

        # 2. Try DB
        link = get_object_or_404(ShortLink, short_code=short_code, is_active=True)
        
        if link.is_expired():
            return None

        # 3. Update Cache
        cache.set(cache_key, link.original_url, timeout=LinkService.CACHE_TTL)
        return link.original_url

    @staticmethod
    def record_click(short_code, request_meta):
        """
        Increments click count in Redis buffer and logs raw analytics.
        """
        # Atomic Redis Increment
        buffer_key = f"clicks:{short_code}"
        try:
            cache.incr(buffer_key)
        except (ValueError, Exception):
            # Key might not exist, set initial
            cache.set(buffer_key, 1, timeout=None)

        # Log detailed analytics (still DB-bound, but counter is offloaded)
        # In high-traffic scenarios, this part should also be buffered/queued
        try:
            link = ShortLink.objects.get(short_code=short_code)
            LinkClick.objects.create(
                link=link,
                ip_address=request_meta.get('ip'),
                user_agent=request_meta.get('ua'),
                referrer=request_meta.get('ref')
            )
        except ShortLink.DoesNotExist:
            pass

    @staticmethod
    def invalidate_cache(short_code):
        cache.delete(f"url:{short_code}")
