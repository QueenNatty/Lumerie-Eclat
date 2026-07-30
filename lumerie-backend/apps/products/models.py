from django.db import models

from .constants import CATEGORY_MAP, MAIN_CATEGORY_CHOICES, get_sub_category_choices


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    main_category = models.CharField(max_length=20, choices=MAIN_CATEGORY_CHOICES)
    sub_category = models.CharField(max_length=30, choices=get_sub_category_choices())
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image_url = models.URLField(blank=True)
    material = models.CharField(max_length=100, blank=True)
    # Stored as a JSON list, e.g. ["gold", "silver"] — avoids a separate
    # ProductColor table for something this simple.
    colors_available = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)  # soft-delete flag
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["main_category", "sub_category"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name

    def is_valid_sub_category(self):
        return self.sub_category in CATEGORY_MAP.get(self.main_category, {})
