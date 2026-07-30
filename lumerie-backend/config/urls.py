"""
Root URL configuration for Lumerie Eclat API.

Every app's URLs are namespaced under /api/<app>/ — this is the single
place that documents the whole API surface at a glance.
"""

from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse

# Custom branding for the Django admin — this is the backend's own
# admin site (at /admin/), separate from the frontend's staff dashboard
# at /admin on the Next.js app. Both exist; this just makes the Django
# one look like Lumerie Éclat instead of the generic "Django administration".
admin.site.site_header = "Lumerie Éclat Administration"
admin.site.site_title = "Lumerie Éclat Admin"
admin.site.index_title = "Store Management"


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
