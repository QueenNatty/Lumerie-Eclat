import logging

from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.cart.models import Cart
from apps.core.response import APIResponse
from apps.products.models import Product

from .emails import send_order_cancelled_email, send_order_confirmation_email
from .models import Order, OrderItem, OrderStatus
from .serializers import CheckoutSerializer, OrderSerializer
from .utils import generate_order_id

logger = logging.getLogger("apps")


class CheckoutView(APIView):
    """POST /api/orders/checkout/ — creates an Order from the user's current cart."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return APIResponse.error(message="Your cart is empty", status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # select_for_update() locks these product rows until the
            # transaction ends — if two users check out overlapping stock
            # at the same instant, the second one waits here, then reads
            # fresh (already-decremented) stock instead of a stale value.
            product_ids = list(cart.items.values_list("product_id", flat=True))
            locked_products = {
                p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
            }
            cart_items = list(cart.items.select_related("product").all())

            # Validate EVERY item before writing anything, so a failed
            # order never partially reduces stock.
            for item in cart_items:
                product = locked_products[item.product_id]
                if not product.is_active:
                    return APIResponse.error(
                        message="One or more items are no longer available",
                        errors={"product": [f"'{product.name}' is no longer available."]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if item.quantity > product.stock:
                    return APIResponse.error(
                        message="Insufficient stock",
                        errors={"product": [f"Only {product.stock} unit(s) of '{product.name}' left."]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            total_amount = sum(
                (locked_products[item.product_id].price * item.quantity for item in cart_items),
                0,
            )

            order = Order.objects.create(
                order_id=generate_order_id(),
                user=request.user,
                status=OrderStatus.PENDING,
                total_amount=total_amount,
                shipping_address=serializer.validated_data.get("shipping_address", ""),
            )

            for item in cart_items:
                product = locked_products[item.product_id]
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    price=product.price,
                    quantity=item.quantity,
                )
                product.stock -= item.quantity
                product.save(update_fields=["stock", "updated_at"])

            cart.items.all().delete()

        logger.info("User '%s' placed order %s", request.user.username, order.order_id)
        send_order_confirmation_email(order)

        return APIResponse.success(
            data=OrderSerializer(order).data, message="Order placed successfully", status=status.HTTP_201_CREATED
        )


class OrderListView(generics.ListAPIView):
    """GET /api/orders/ — the logged-in user's own orders only, paginated."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return APIResponse.success(data=serializer.data)


class OrderDetailView(APIView):
    """
    GET /api/orders/<order_id>/ — own order only.

    We look the order up scoped to `user=request.user` rather than fetching
    by order_id alone and then checking ownership — a mismatch returns a
    plain 404, so a user probing other people's order IDs can't even tell
    whether an order exists.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = Order.objects.filter(order_id=order_id, user=request.user).first()
        if not order:
            return APIResponse.error(message="Order not found", status=status.HTTP_404_NOT_FOUND)
        return APIResponse.success(data=OrderSerializer(order).data)


class OrderCancelView(APIView):
    """POST /api/orders/<order_id>/cancel/ — only Pending or Confirmed orders can be cancelled."""

    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = Order.objects.filter(order_id=order_id, user=request.user).first()
        if not order:
            return APIResponse.error(message="Order not found", status=status.HTTP_404_NOT_FOUND)

        if not order.is_cancellable:
            return APIResponse.error(
                message=f"An order with status '{order.status}' cannot be cancelled",
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            for item in order.items.select_related("product"):
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=["stock", "updated_at"])
            order.status = OrderStatus.CANCELLED
            order.save(update_fields=["status", "updated_at"])

        logger.info("User '%s' cancelled order %s", request.user.username, order.order_id)
        send_order_cancelled_email(order)

        return APIResponse.success(data=OrderSerializer(order).data, message="Order cancelled successfully")
