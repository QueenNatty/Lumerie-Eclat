import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.core.response import APIResponse

from .serializers import (
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)

logger = logging.getLogger("apps")


class RegisterView(APIView):
    """POST /api/accounts/register/ — public. Creates a user and logs them in immediately."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Log the new user in right away — better UX than making them
        # submit a second login request straight after registering.
        refresh = RefreshToken.for_user(user)
        logger.info("New user registered: %s", user.username)

        return APIResponse.success(
            data={
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            message="Registration successful",
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    POST /api/accounts/login/ — public. Accepts {"username": "<username or email>", "password": "..."}.
    """

    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        # raise_exception=True hands validation errors to our custom
        # exception handler (apps/core/exceptions.py), so we get the same
        # consistent error envelope for free instead of writing a
        # try/except here.
        serializer.is_valid(raise_exception=True)
        logger.info("User '%s' logged in", request.data.get("username"))
        return APIResponse.success(data=serializer.validated_data, message="Login successful")


class LogoutView(APIView):
    """POST /api/accounts/logout/ — blacklists the given refresh token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return APIResponse.error(
                message="Refresh token is required",
                errors={"refresh": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            return APIResponse.error(
                message="Invalid or expired token",
                status=status.HTTP_400_BAD_REQUEST,
            )

        logger.info("User '%s' logged out", request.user.username)
        return APIResponse.success(message="Logged out successfully")


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/accounts/profile/ — always operates on the logged-in user."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return APIResponse.success(data=serializer.data, message="Profile fetched successfully")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Always partial — a PATCH-only profile endpoint means the
        # frontend never has to resend fields it isn't changing.
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info("User '%s' updated their profile", request.user.username)
        return APIResponse.success(data=serializer.data, message="Profile updated successfully")


class ChangePasswordView(APIView):
    """POST /api/accounts/change-password/"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return APIResponse.error(
                message="Old password is incorrect",
                errors={"old_password": ["Incorrect password."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        logger.info("User '%s' changed their password", user.username)
        return APIResponse.success(message="Password changed successfully")
