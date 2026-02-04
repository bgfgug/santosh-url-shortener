
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator, MinValueValidator
from django.utils import timezone
from django.core.cache import cache
import random
import string
from urllib.parse import urlparse

def generate_short_code():
    length = 6
    characters = string.ascii_letters + string.digits
    while True:
        code = ''.join(random.choices(characters, k=length))
        if not ShortLink.objects.filter(short_code=code).exists():
            return code

def validate_url_protocol(value):
    parsed = urlparse(value)
    if parsed.scheme not in ['http', 'https']:
        raise ValidationError("Only http and https protocols are allowed.")

class ShortLink(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='links')
    original_url = models.URLField(max_length=2000, validators=[validate_url_protocol])
    short_code = models.CharField(
        max_length=50, 
        unique=True, 
        db_index=True,
        validators=[RegexValidator(regex=r'^[\w-]+$')]
    )
    click_count = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    def save(self, *args, **kwargs):
        if not self.short_code:
            self.short_code = generate_short_code()
        self.short_code = self.short_code.strip()
        
        # Invalidate Cache
        cache.delete(f"url:{self.short_code}")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        cache.delete(f"url:{self.short_code}")
        cache.delete(f"clicks:{self.short_code}")
        super().delete(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['owner', '-created_at'])]
