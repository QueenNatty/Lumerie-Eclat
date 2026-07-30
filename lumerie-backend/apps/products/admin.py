from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "main_category", "sub_category", "price", "stock", "is_active", "created_at")
    list_filter = ("main_category", "sub_category", "is_active")
    search_fields = ("name", "description", "material")
