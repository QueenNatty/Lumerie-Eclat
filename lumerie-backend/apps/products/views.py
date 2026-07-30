import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.views import APIView

from apps.core.response import APIResponse

from .constants import CATEGORY_MAP
from .filters import ProductFilter
from .models import Product
from .serializers import ProductAdminSerializer, ProductSerializer

logger = logging.getLogger("apps")


class ProductListView(generics.ListAPIView):
    """GET /api/products/ — public. Search, category/price filters, pagination."""

    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "material"]
    ordering_fields = ["price", "created_at", "name"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return APIResponse.success(data=serializer.data)


class ProductDetailView(generics.RetrieveAPIView):
    """GET /api/products/<id>/ — public. Only active products are visible."""

    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return APIResponse.success(data=serializer.data)


class CategoriesView(APIView):
    """GET /api/products/categories/ — public. Returns the full category -> sub-category map."""

    permission_classes = [AllowAny]

    def get(self, request):
        return APIResponse.success(data=CATEGORY_MAP)


class ProductAdminListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/products/admin/ — admin only. Lists ALL products (active + inactive).
    POST /api/products/admin/ — admin only. Create a product.
    """

    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminUser]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "material"]
    ordering_fields = ["price", "created_at", "name", "stock"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return APIResponse.success(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        logger.info("Admin '%s' created product '%s'", request.user.username, product.name)
        return APIResponse.success(
            data=serializer.data, message="Product created successfully", status=status.HTTP_201_CREATED
        )


class ProductAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/products/admin/<id>/ — admin only.
    DELETE performs a SOFT delete: sets is_active=False, never removes the row
    (order history depends on the row still existing).
    """

    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminUser]

    def retrieve(self, request, *args, **kwargs):
        return APIResponse.success(data=self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info("Admin '%s' updated product '%s'", request.user.username, instance.name)
        return APIResponse.success(data=serializer.data, message="Product updated successfully")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        logger.info("Admin '%s' soft-deleted product '%s'", request.user.username, instance.name)
        return APIResponse.success(message="Product deactivated successfully")
