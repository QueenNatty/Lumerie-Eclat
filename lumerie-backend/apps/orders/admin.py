from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "product_name", "price", "quantity")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_id", "user", "status", "total_amount", "created_at")
    list_filter = ("status",)
    search_fields = ("order_id", "user__username", "user__email")
    inlines = [OrderItemInline]
