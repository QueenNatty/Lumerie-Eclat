"""
Root URL configuration for Lumerie Eclat API.

Every app's URLs are namespaced under /api/<app>/ — this is the single
place that documents the whole API surface at a glance.
"""

from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse


def health_check(request):
    """Simple uptime check — handy for Render/Railway health probes."""
    return JsonResponse({"success": True, "message": "Lumerie Eclat API is running"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/cart/", include("apps.cart.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
]
