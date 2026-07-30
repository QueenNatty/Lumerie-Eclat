from django.urls import path

from .views import (
    CategoriesView,
    ProductAdminDetailView,
    ProductAdminListCreateView,
    ProductDetailView,
    ProductListView,
)

app_name = "products"

urlpatterns = [
    path("", ProductListView.as_view(), name="product-list"),
    path("categories/", CategoriesView.as_view(), name="categories"),
    path("admin/", ProductAdminListCreateView.as_view(), name="admin-product-list-create"),
    path("admin/<int:pk>/", ProductAdminDetailView.as_view(), name="admin-product-detail"),
    path("<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
]
