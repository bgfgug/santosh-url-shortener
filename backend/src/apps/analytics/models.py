
from django.db import models
from src.apps.links.models import ShortLink

class LinkClick(models.Model):
    """Detailed analytics for every click."""
    link = models.ForeignKey(ShortLink, on_delete=models.CASCADE, related_name='analytics_logs')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    referrer = models.URLField(max_length=1000, null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Link Analytics Entry"
        verbose_name_plural = "Link Analytics Entries"

    def __str__(self):
        return f"Click on {self.link.short_code} at {self.timestamp}"
