from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new-user signup. `validate_password` runs Django's configured
    AUTH_PASSWORD_VALIDATORS (length, common-password, similarity, etc.)
    automatically — we don't have to reimplement any of those rules.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "phone_number",
        )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)  # never store a raw password
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Used for viewing and updating the logged-in user's own profile."""

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "date_joined",
            "is_staff",
        )
        read_only_fields = ("id", "username", "date_joined", "is_staff")

    def validate_email(self, value):
        qs = User.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True, label="Confirm new password")

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password2": "Passwords do not match."})
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    SimpleJWT's default serializer only accepts the model's USERNAME_FIELD
    (here, `username`). To support "login with username OR email", we
    resolve an email input to the matching username BEFORE handing off to
    the parent class, which then authenticates normally.
    """

    def validate(self, attrs):
        login_input = attrs.get(self.username_field)
        if login_input and "@" in login_input:
            try:
                matched_user = User.objects.get(email__iexact=login_input)
                attrs[self.username_field] = matched_user.get_username()
            except User.DoesNotExist:
                pass  # fall through — parent class will raise "no active account"
        return super().validate(attrs)
