"""
Custom user model extending Django's AbstractUser.

Using a custom model from day one avoids the pain of migrating
away from ``auth.User`` later.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Project user — identical to Django's default for now, but extensible."""

    username = models.CharField(
        "username",
        max_length=150,
        unique=False,
        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
    )
    email = models.EmailField("email address", unique=True)

    # Use email for authentication instead of username
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-date_joined"]

    def __str__(self) -> str:
        return self.email
