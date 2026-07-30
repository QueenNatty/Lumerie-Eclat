"""
Human-readable order ID generation.

Format: ORD-YYYYMMDD-0001 — resets to 0001 each day. The sequence is
derived by counting today's existing orders. This is called from inside
CheckoutView's `transaction.atomic()` block, which combined with
`select_for_update()` on the cart's products serializes concurrent
checkouts enough for a school-project's traffic level. At very high
concurrency you'd instead want a dedicated sequence table (or Postgres's
own SEQUENCE) to guarantee no gaps/collisions — worth knowing as a next
step, not needed here.
"""

from django.utils import timezone

from .models import Order


def generate_order_id():
    today_str = timezone.now().strftime("%Y%m%d")
    prefix = f"ORD-{today_str}-"
    todays_count = Order.objects.filter(order_id__startswith=prefix).count()
    next_number = todays_count + 1
    return f"{prefix}{next_number:04d}"
