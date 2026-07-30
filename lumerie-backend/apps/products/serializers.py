from rest_framework import serializers

from .constants import CATEGORY_MAP
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Public-facing — used for browse/search/detail. No `is_active` field: it's implied by being listed at all."""

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "main_category",
            "sub_category",
            "price",
            "stock",
            "image_url",
            "material",
            "colors_available",
            "created_at",
            "updated_at",
        )


class ProductAdminSerializer(serializers.ModelSerializer):
    """Admin create/update — includes is_active, and enforces sub_category belongs to main_category."""

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "main_category",
            "sub_category",
            "price",
            "stock",
            "image_url",
            "material",
            "colors_available",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        main_category = attrs.get("main_category", getattr(self.instance, "main_category", None))
        sub_category = attrs.get("sub_category", getattr(self.instance, "sub_category", None))
        valid_subs = CATEGORY_MAP.get(main_category, {})
        if sub_category not in valid_subs:
            raise serializers.ValidationError(
                {"sub_category": f"'{sub_category}' is not a valid sub-category for '{main_category}'."}
            )
        return attrs

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
