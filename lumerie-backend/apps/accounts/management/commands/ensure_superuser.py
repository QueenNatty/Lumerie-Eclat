"""
Creates a superuser from environment variables if one with that username
doesn't already exist. Safe to run on every deploy — does nothing if the
account is already there.

Why this exists: Render's Shell tab (the normal way to run
`createsuperuser` interactively) requires a paid instance type. This
command lets the free tier get an admin account too, by reading
DJANGO_SUPERUSER_USERNAME / _EMAIL / _PASSWORD (already in .env.example)
and creating the account automatically as part of the deploy's start
command.

Usage: python manage.py ensure_superuser
"""

import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Creates a superuser from DJANGO_SUPERUSER_* env vars if one doesn't already exist."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    "DJANGO_SUPERUSER_USERNAME/_PASSWORD not set — skipping superuser bootstrap."
                )
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(f"Superuser '{username}' already exists — nothing to do.")
            return

        User.objects.create_superuser(username=username, email=email or "", password=password)
        self.stdout.write(self.style.SUCCESS(f"Created superuser '{username}'."))
