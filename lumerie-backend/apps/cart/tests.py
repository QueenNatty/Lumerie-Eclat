from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Product

User = get_user_model()


class CartTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="nae", email="nae@example.com", password="pass12345")
        self.client.force_authenticate(self.user)
        self.product = Product.objects.create(
            name="Beanie", main_category="crochet", sub_category="beanies", price=Decimal("15.00"), stock=3
        )

    def test_add_item_to_cart(self):
        response = self.client.post(
            reverse("cart:cart-item-list"), {"product_id": self.product.id, "quantity": 2}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["total_items"], 2)

    def test_cannot_add_more_than_stock(self):
        response = self.client.post(
            reverse("cart:cart-item-list"), {"product_id": self.product.id, "quantity": 10}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_item_quantity(self):
        add_response = self.client.post(
            reverse("cart:cart-item-list"), {"product_id": self.product.id, "quantity": 1}
        )
        item_id = add_response.data["data"]["items"][0]["id"]
        response = self.client.patch(reverse("cart:cart-item-detail", args=[item_id]), {"quantity": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["total_items"], 2)

    def test_remove_item(self):
        add_response = self.client.post(
            reverse("cart:cart-item-list"), {"product_id": self.product.id, "quantity": 1}
        )
        item_id = add_response.data["data"]["items"][0]["id"]
        response = self.client.delete(reverse("cart:cart-item-detail", args=[item_id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["total_items"], 0)

    def test_clear_cart(self):
        self.client.post(reverse("cart:cart-item-list"), {"product_id": self.product.id, "quantity": 1})
        response = self.client.delete(reverse("cart:cart-clear"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart_response = self.client.get(reverse("cart:cart-detail"))
        self.assertEqual(cart_response.data["data"]["total_items"], 0)

    def test_cart_requires_authentication(self):
        self.client.force_authenticate(None)
        response = self.client.get(reverse("cart:cart-detail"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
