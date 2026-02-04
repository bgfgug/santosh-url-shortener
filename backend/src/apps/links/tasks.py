
from django.core.cache import cache
from django.db.models import F
from .models import ShortLink
import logging

logger = logging.getLogger(__name__)

def sync_click_counts():
    """
    Synchronizes buffered click counts from Redis to PostgreSQL.
    Run this via Celery or Cron every 5 minutes.
    """
    # Note: In a production environment with many links, 
    # use a Redis Set to track 'dirty' keys instead of scanning.
    # For now, we use a simple approach.
    
    # Placeholder for a more efficient discovery method
    # Here we assume we can list keys or have a set 'dirty_links'
    
    # Example logic for a set of dirty keys:
    # dirty_keys = cache.get("dirty_links", [])
    
    # Fallback to a simplified scan if necessary
    # (Not recommended for massive DBs, but works for the current scale)
    from django_redis import get_redis_connection
    con = get_redis_connection("default")
    
    for key in con.scan_iter("clicks:*"):
        short_code = key.decode().split(":")[1]
        try:
            count = int(con.get(key) or 0)
            if count > 0:
                # Atomic update in DB
                ShortLink.objects.filter(short_code=short_code).update(
                    click_count=F('click_count') + count
                )
                # Reset Redis counter
                con.set(key, 0)
                logger.info(f"Synced {count} clicks for {short_code}")
        except Exception as e:
            logger.error(f"Failed to sync {short_code}: {e}")
