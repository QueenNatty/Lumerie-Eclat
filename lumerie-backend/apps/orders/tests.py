from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.cart.models import Cart, CartItem
from apps.products.models import Product

User = get_user_model()


class CheckoutTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="nae", email="nae@example.com", password="pass12345")
        self.client.force_authenticate(self.user)
        self.product = Product.objects.create(
            name="Scarf", main_category="crochet", sub_category="scarves", price=Decimal("20.00"), stock=5
        )
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)

    def test_checkout_creates_order_and_reduces_stock(self):
        response = self.client.post(reverse("orders:checkout"), {})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        self.assertTrue(response.data["data"]["order_id"].startswith("ORD-"))
        self.assertEqual(Decimal(response.data["data"]["total_amount"]), Decimal("40.00"))

    def test_checkout_empties_cart(self):
        self.client.post(reverse("orders:checkout"), {})
        cart_response = self.client.get(reverse("cart:cart-detail"))
        self.assertEqual(cart_response.data["data"]["total_items"], 0)

    def test_checkout_fails_on_empty_cart(self):
        CartItem.objects.all().delete()
        response = self.client.post(reverse("orders:checkout"), {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_fails_when_quantity_exceeds_stock(self):
        CartItem.objects.filter(product=self.product).update(quantity=100)
        response = self.client.post(reverse("orders:checkout"), {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)  # untouched

    def test_cancel_order_restocks_product(self):
        checkout_response = self.client.post(reverse("orders:checkout"), {})
        order_id = checkout_response.data["data"]["order_id"]
        response = self.client.post(reverse("orders:order-cancel", args=[order_id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)

    def test_only_owner_can_view_order(self):
        checkout_response = self.client.post(reverse("orders:checkout"), {})
        order_id = checkout_response.data["data"]["order_id"]
        other_user = User.objects.create_user(username="other", email="other@example.com", password="pass12345")
        self.client.force_authenticate(other_user)
        response = self.client.get(reverse("orders:order-detail", args=[order_id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_cancel_shipped_order(self):
        from apps.orders.models import Order, OrderStatus

        checkout_response = self.client.post(reverse("orders:checkout"), {})
        order_id = checkout_response.data["data"]["order_id"]
        Order.objects.filter(order_id=order_id).update(status=OrderStatus.SHIPPED)
        response = self.client.post(reverse("orders:order-cancel", args=[order_id]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
