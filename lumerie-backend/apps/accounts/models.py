"""
Custom user model.

We extend Django's AbstractUser rather than starting from AbstractBaseUser
because we still want username-based login (simpler for a beginner-facing
project) — we just add email uniqueness and a phone number, and allow
lookup by email too (handled in the login serializer, not here).
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # AbstractUser's email field is NOT unique by default — we fix that,
    # since "login with username or email" and "unique email" both
    # depend on it.
    email = models.EmailField("email address", unique=True)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username
