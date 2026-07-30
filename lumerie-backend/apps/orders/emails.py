"""
Order lifecycle emails.

Uses Django's console email backend (configured in settings.py) — nothing
is actually sent, it's printed to the terminal running the dev server.
Swap EMAIL_BACKEND for a real SMTP backend when you have credentials;
nothing in this file needs to change.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger("apps")


def _send(subject, message, recipient):
    if not recipient:
        return
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=False)
    except Exception:
        # An email failure should never break the request/response cycle —
        # log it and move on.
        logger.exception("Failed to send email '%s' to %s", subject, recipient)


def send_order_confirmation_email(order):
    lines = [
        f"Hi {order.user.first_name or order.user.username},",
        "",
        f"Thanks for your order! {order.order_id} has been received.",
        "",
        "Items:",
    ]
    for item in order.items.all():
        lines.append(f"  - {item.quantity} x {item.product_name} @ {item.price} = {item.subtotal}")
    lines += ["", f"Total: {order.total_amount}", "", "We'll email you when it ships.", "", "— Lumerie Eclat"]
    _send(f"Order Confirmed — {order.order_id}", "\n".join(lines), order.user.email)


def send_order_shipped_email(order):
    message = (
        f"Hi {order.user.first_name or order.user.username},\n\n"
        f"Good news — your order {order.order_id} is on its way!\n\n"
        "— Lumerie Eclat"
    )
    _send(f"Your order {order.order_id} has shipped", message, order.user.email)


def send_order_cancelled_email(order):
    message = (
        f"Hi {order.user.first_name or order.user.username},\n\n"
        f"Your order {order.order_id} has been cancelled. "
        "If this wasn't you, please contact support.\n\n"
        "— Lumerie Eclat"
    )
    _send(f"Your order {order.order_id} was cancelled", message, order.user.email)
