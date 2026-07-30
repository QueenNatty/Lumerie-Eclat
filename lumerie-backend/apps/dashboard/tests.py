from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Product

User = get_user_model()


class DashboardTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="AdminPass123!"
        )
        self.user = User.objects.create_user(username="nae", email="nae@example.com", password="pass12345")
        Product.objects.create(
            name="Low Stock Ring", main_category="jewelry", sub_category="rings", price=Decimal("30.00"), stock=2
        )

    def test_non_admin_cannot_access_stats(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("dashboard:stats"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_stats(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(reverse("dashboard:stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_revenue", response.data["data"])

    def test_low_stock_endpoint_returns_only_low_stock(self):
        Product.objects.create(
            name="Well Stocked", main_category="jewelry", sub_category="watches", price=Decimal("100.00"), stock=50
        )
        self.client.force_authenticate(self.admin)
        response = self.client.get(reverse("dashboard:low-stock-products"))
        names = [p["name"] for p in response.data["data"]]
        self.assertIn("Low Stock Ring", names)
        self.assertNotIn("Well Stocked", names)

    def test_anonymous_cannot_access_dashboard(self):
        response = self.client.get(reverse("dashboard:stats"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
