from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Product

User = get_user_model()


class ProductTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="AdminPass123!"
        )
        self.product = Product.objects.create(
            name="Gold Ring", main_category="jewelry", sub_category="rings", price=Decimal("50.00"), stock=10
        )

    def test_public_can_list_active_products(self):
        response = self.client.get(reverse("products:product-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_inactive_products_hidden_from_public_list(self):
        self.product.is_active = False
        self.product.save()
        response = self.client.get(reverse("products:product-list"))
        results = response.data["data"]["results"]
        self.assertFalse(any(p["id"] == self.product.id for p in results))

    def test_categories_endpoint_is_public(self):
        response = self.client.get(reverse("products:categories"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("jewelry", response.data["data"])
        self.assertIn("crochet", response.data["data"])

    def test_non_admin_cannot_create_product(self):
        response = self.client.post(reverse("products:admin-product-list-create"), {"name": "x"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_create_product_with_valid_subcategory(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "name": "Silver Necklace",
            "main_category": "jewelry",
            "sub_category": "necklaces",
            "price": "80.00",
            "stock": 5,
        }
        response = self.client.post(reverse("products:admin-product-list-create"), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_rejects_mismatched_subcategory(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "name": "Bad Product",
            "main_category": "jewelry",
            "sub_category": "beanies",  # belongs to crochet, not jewelry
            "price": "10.00",
            "stock": 1,
        }
        response = self.client.post(reverse("products:admin-product-list-create"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_soft_delete_deactivates_not_removes(self):
        self.client.force_authenticate(self.admin)
        url = reverse("products:admin-product-detail", args=[self.product.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertFalse(self.product.is_active)
        self.assertTrue(Product.objects.filter(id=self.product.id).exists())

    def test_price_filter(self):
        Product.objects.create(
            name="Cheap Bracelet", main_category="jewelry", sub_category="bracelets", price=Decimal("5.00"), stock=1
        )
        response = self.client.get(reverse("products:product-list"), {"min_price": 20})
        results = response.data["data"]["results"]
        self.assertTrue(all(float(p["price"]) >= 20 for p in results))
