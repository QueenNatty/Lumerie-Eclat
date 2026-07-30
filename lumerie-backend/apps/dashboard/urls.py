from django.urls import path

from .views import (
    AdminOrderCancelView,
    AdminOrderListView,
    AdminOrderStatusUpdateView,
    LowStockProductsView,
    StatsView,
)

app_name = "dashboard"

urlpatterns = [
    path("stats/", StatsView.as_view(), name="stats"),
    path("orders/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("orders/<str:order_id>/status/", AdminOrderStatusUpdateView.as_view(), name="admin-order-status"),
    path("orders/<str:order_id>/cancel/", AdminOrderCancelView.as_view(), name="admin-order-cancel"),
    path("products/low-stock/", LowStockProductsView.as_view(), name="low-stock-products"),
]
