"""
Custom exception handler.

DRF's default exception handler returns error bodies in inconsistent
shapes depending on the exception type (a plain list for some, a dict
for others). We wrap it so EVERY error response — validation errors,
403s, 404s, throttling, uncaught 500s — comes back in the same
{ "success": false, "message": ..., "errors": ... } shape.
"""

import logging

from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response

logger = logging.getLogger("apps")


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is not None:
        errors = response.data
        message = "Request failed"

        # DRF puts a top-level "detail" key on most non-validation errors
        # (403, 404, throttled, auth failures). Surface that as the message
        # and keep `errors` clean.
        if isinstance(errors, dict) and "detail" in errors:
            message = str(errors["detail"])
            errors = {} if len(errors) == 1 else {k: v for k, v in errors.items() if k != "detail"}

        response.data = {
            "success": False,
            "message": message,
            "errors": errors,
        }
        return response

    # Uncaught exception -> DRF's handler returned None -> would be a 500.
    # Log it with full context so it's traceable, and never leak a raw
    # traceback to the client.
    logger.exception("Unhandled exception in %s", context.get("view"))
    return Response(
        {
            "success": False,
            "message": "Internal server error",
            "errors": {},
        },
        status=500,
    )
