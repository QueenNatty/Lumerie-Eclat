import logging

from django.db import transaction
from django.db.models import Count, Sum
from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView

from apps.core.response import APIResponse
from apps.orders.emails import send_order_cancelled_email, send_order_shipped_email
from apps.orders.models import Order, OrderStatus
from apps.products.models import Product
from apps.products.serializers import ProductAdminSerializer

from .filters import AdminOrderFilter
from .serializers import AdminOrderSerializer, OrderStatusUpdateSerializer

logger = logging.getLogger("apps")

LOW_STOCK_THRESHOLD = 5


class StatsView(APIView):
    """GET /api/dashboard/stats/ — admin only. High-level store metrics."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        revenue_orders = Order.objects.exclude(status=OrderStatus.CANCELLED)
        total_revenue = revenue_orders.aggregate(total=Sum("total_amount"))["total"] or 0
        status_counts = dict(Order.objects.values_list("status").annotate(count=Count("id")))

        data = {
            "total_orders": Order.objects.count(),
            "total_revenue": total_revenue,
            "orders_by_status": status_counts,
            "total_active_products": Product.objects.filter(is_active=True).count(),
            "low_stock_count": Product.objects.filter(is_active=True, stock__lte=LOW_STOCK_THRESHOLD).count(),
            "recent_orders": AdminOrderSerializer(Order.objects.all()[:5], many=True).data,
        }
        return APIResponse.success(data=data)


class AdminOrderListView(generics.ListAPIView):
    """GET /api/dashboard/orders/ — admin only. All orders, paginated + filterable by status."""

    queryset = Order.objects.all()
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUser]
    filterset_class = AdminOrderFilter
    search_fields = ["order_id", "user__username", "user__email"]
    ordering_fields = ["created_at", "total_amount", "status"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return APIResponse.success(data=serializer.data)


class AdminOrderStatusUpdateView(APIView):
    """PATCH /api/dashboard/orders/<order_id>/status/ — admin only. Triggers shipped/cancelled emails."""

    permission_classes = [IsAdminUser]

    def patch(self, request, order_id):
        order = Order.objects.filter(order_id=order_id).first()
        if not order:
            return APIResponse.error(message="Order not found", status=status.HTTP_404_NOT_FOUND)

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]

        order.status = new_status
        order.save(update_fields=["status", "updated_at"])
        logger.info("Admin '%s' set order %s to '%s'", request.user.username, order.order_id, new_status)

        if new_status == OrderStatus.SHIPPED:
            send_order_shipped_email(order)
        elif new_status == OrderStatus.CANCELLED:
            send_order_cancelled_email(order)

        return APIResponse.success(data=AdminOrderSerializer(order).data, message="Order status updated")


class AdminOrderCancelView(APIView):
    """POST /api/dashboard/orders/<order_id>/cancel/ — admin can force-cancel ANY order, any status."""

    permission_classes = [IsAdminUser]

    def post(self, request, order_id):
        order = Order.objects.filter(order_id=order_id).first()
        if not order:
            return APIResponse.error(message="Order not found", status=status.HTTP_404_NOT_FOUND)
        if order.status == OrderStatus.CANCELLED:
            return APIResponse.error(message="Order is already cancelled", status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for item in order.items.select_related("product"):
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=["stock", "updated_at"])
            order.status = OrderStatus.CANCELLED
            order.save(update_fields=["status", "updated_at"])

        logger.info("Admin '%s' force-cancelled order %s", request.user.username, order.order_id)
        send_order_cancelled_email(order)

        return APIResponse.success(data=AdminOrderSerializer(order).data, message="Order cancelled successfully")


class LowStockProductsView(APIView):
    """GET /api/dashboard/products/low-stock/ — admin only."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        products = Product.objects.filter(is_active=True, stock__lte=LOW_STOCK_THRESHOLD).order_by("stock")
        return APIResponse.success(data=ProductAdminSerializer(products, many=True).data)
