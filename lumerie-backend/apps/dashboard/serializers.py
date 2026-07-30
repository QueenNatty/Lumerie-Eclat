from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.orders.models import Order
from apps.orders.serializers import OrderItemSerializer


class AdminOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_id",
            "user",
            "status",
            "total_amount",
            "shipping_address",
            "items",
            "created_at",
            "updated_at",
        )


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order._meta.get_field("status").choices)
