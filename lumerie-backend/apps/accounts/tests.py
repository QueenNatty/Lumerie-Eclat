from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def test_register_creates_user_and_returns_tokens(self):
        payload = {
            "username": "nae",
            "email": "nae@example.com",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = self.client.post(reverse("accounts:register"), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data["data"])
        self.assertTrue(User.objects.filter(username="nae").exists())

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(username="existing", email="dup@example.com", password="pass12345")
        payload = {
            "username": "newuser",
            "email": "dup@example.com",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = self.client.post(reverse("accounts:register"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rejects_mismatched_passwords(self):
        payload = {
            "username": "nae",
            "email": "nae@example.com",
            "password": "StrongPass123!",
            "password2": "DifferentPass123!",
        }
        response = self.client.post(reverse("accounts:register"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_username(self):
        User.objects.create_user(username="nae", email="nae@example.com", password="StrongPass123!")
        response = self.client.post(
            reverse("accounts:login"), {"username": "nae", "password": "StrongPass123!"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data["data"])

    def test_login_with_email(self):
        User.objects.create_user(username="nae", email="nae@example.com", password="StrongPass123!")
        response = self.client.post(
            reverse("accounts:login"), {"username": "nae@example.com", "password": "StrongPass123!"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data["data"])

    def test_login_rejects_wrong_password(self):
        User.objects.create_user(username="nae", email="nae@example.com", password="StrongPass123!")
        response = self.client.post(reverse("accounts:login"), {"username": "nae", "password": "wrong"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_requires_authentication(self):
        response = self.client.get(reverse("accounts:profile"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_returns_own_data(self):
        user = User.objects.create_user(username="nae", email="nae@example.com", password="StrongPass123!")
        self.client.force_authenticate(user)
        response = self.client.get(reverse("accounts:profile"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["username"], "nae")

    def test_change_password_requires_correct_old_password(self):
        user = User.objects.create_user(username="nae", email="nae@example.com", password="OldPass123!")
        self.client.force_authenticate(user)
        response = self.client.post(
            reverse("accounts:change-password"),
            {"old_password": "wrong", "new_password": "NewPass123!", "new_password2": "NewPass123!"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_succeeds(self):
        user = User.objects.create_user(username="nae", email="nae@example.com", password="OldPass123!")
        self.client.force_authenticate(user)
        response = self.client.post(
            reverse("accounts:change-password"),
            {"old_password": "OldPass123!", "new_password": "NewPass123!", "new_password2": "NewPass123!"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass123!"))
