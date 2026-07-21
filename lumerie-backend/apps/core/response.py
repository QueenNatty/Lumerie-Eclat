"""
Consistent JSON response envelope used across the whole API.

Every endpoint — success or failure — returns the same shape:

    { "success": true,  "data": ..., "message": "..." }
    { "success": false, "errors": {...}, "message": "..." }

This means the Next.js frontend can write ONE response handler instead
of guessing the shape per-endpoint.
"""

from rest_framework.response import Response


class APIResponse:
    @staticmethod
    def success(data=None, message="Success", status=200, extra=None):
        payload = {"success": True, "message": message, "data": data}
        if extra:
            payload.update(extra)
        return Response(payload, status=status)

    @staticmethod
    def error(errors=None, message="Something went wrong", status=400):
        return Response(
            {"success": False, "message": message, "errors": errors or {}},
            status=status,
        )
