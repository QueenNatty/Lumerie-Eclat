"""
Reusable permission classes for the accounts app.

`IsSelf` isn't needed by the endpoints in this phase (ProfileView already
scopes to `request.user` directly via `get_object`), but it's here for
any future endpoint that operates on a `User` instance passed in by pk —
e.g. an admin-facing "view any user" endpoint that should still block a
non-admin from editing someone else's account.
"""

from rest_framework.permissions import BasePermission


class IsSelf(BasePermission):
    """Grants object-level access only when `obj` is the requesting user."""

    def has_object_permission(self, request, view, obj):
        return obj == request.user
