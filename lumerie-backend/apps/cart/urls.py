from django.urls import path

from .views import CartItemDetailView, CartItemListView, CartView, ClearCartView

app_name = "cart"

urlpatterns = [
    path("", CartView.as_view(), name="cart-detail"),
    path("clear/", ClearCartView.as_view(), name="cart-clear"),
    path("items/", CartItemListView.as_view(), name="cart-item-list"),
    path("items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"),
]
