import django_filters

from apps.orders.models import Order


class AdminOrderFilter(django_filters.FilterSet):
    class Meta:
        model = Order
        fields = ["status"]
