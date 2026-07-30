from rest_framework.permissions import BasePermission


class IsOrderOwner(BasePermission):
    """Object-level check: the order belongs to the requesting user."""

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
