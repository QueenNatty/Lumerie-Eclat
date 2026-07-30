from django.urls import path

from .views import CheckoutView, OrderCancelView, OrderDetailView, OrderListView

app_name = "orders"

urlpatterns = [
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("", OrderListView.as_view(), name="order-list"),
    path("<str:order_id>/", OrderDetailView.as_view(), name="order-detail"),
    path("<str:order_id>/cancel/", OrderCancelView.as_view(), name="order-cancel"),
]
