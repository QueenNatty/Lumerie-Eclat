import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.core.response import APIResponse
from apps.products.models import Product

from .models import Cart, CartItem
from .serializers import AddCartItemSerializer, CartSerializer, UpdateCartItemSerializer

logger = logging.getLogger("apps")


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    """GET /api/cart/ — view your own cart (created automatically if it doesn't exist yet)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        return APIResponse.success(data=CartSerializer(cart).data)


class ClearCartView(APIView):
    """DELETE /api/cart/clear/ — remove every item from the cart."""

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        logger.info("User '%s' cleared their cart", request.user.username)
        return APIResponse.success(message="Cart cleared successfully")


class CartItemListView(APIView):
    """POST /api/cart/items/ — add an item (bumps quantity if it's already in the cart)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = get_or_create_cart(request.user)
        product = Product.objects.get(pk=serializer.validated_data["product_id"])
        quantity = serializer.validated_data["quantity"]

        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})
        if not created:
            new_quantity = item.quantity + quantity
            if new_quantity > product.stock:
                return APIResponse.error(
                    message="Not enough stock",
                    errors={"quantity": [f"Only {product.stock} unit(s) left in stock."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_quantity
            item.save()

        logger.info("User '%s' added %s x '%s' to cart", request.user.username, quantity, product.name)
        return APIResponse.success(
            data=CartSerializer(cart).data, message="Item added to cart", status=status.HTTP_201_CREATED
        )


class CartItemDetailView(APIView):
    """PATCH /api/cart/items/<id>/ — update quantity. DELETE /api/cart/items/<id>/ — remove item."""

    permission_classes = [IsAuthenticated]

    def get_item(self, request, pk):
        return CartItem.objects.filter(pk=pk, cart__user=request.user).first()

    def patch(self, request, pk):
        item = self.get_item(request, pk)
        if not item:
            return APIResponse.error(message="Cart item not found", status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data["quantity"]

        if quantity > item.product.stock:
            return APIResponse.error(
                message="Not enough stock",
                errors={"quantity": [f"Only {item.product.stock} unit(s) left in stock."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity
        item.save()
        logger.info("User '%s' updated cart item %s to qty %s", request.user.username, item.id, quantity)
        return APIResponse.success(data=CartSerializer(item.cart).data, message="Cart item updated")

    def delete(self, request, pk):
        item = self.get_item(request, pk)
        if not item:
            return APIResponse.error(message="Cart item not found", status=status.HTTP_404_NOT_FOUND)
        cart = item.cart
        item.delete()
        logger.info("User '%s' removed cart item %s", request.user.username, pk)
        return APIResponse.success(data=CartSerializer(cart).data, message="Item removed from cart")
