from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


class LoginViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.login_url = "/auth/login/"

    def test_login_success(self):
        response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Login successful")
        self.assertEqual(response.data["user"]["username"], "testuser")

    def test_login_invalid_username(self):
        response = self.client.post(
            self.login_url,
            {"username": "wronguser", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["error"], "Invalid credentials")

    def test_login_invalid_password(self):
        response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "wrongpass"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["error"], "Invalid credentials")

    def test_login_missing_credentials(self):
        response = self.client.post(self.login_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Username and password are required")

    def test_login_missing_username(self):
        response = self.client.post(
            self.login_url, {"password": "testpass123"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_missing_password(self):
        response = self.client.post(
            self.login_url, {"username": "testuser"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LogoutViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.logout_url = "/auth/logout/"

    def test_logout_success(self):
        self.client.force_login(self.user)
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Logout successful")

    def test_logout_unauthenticated(self):
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CurrentUserViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.current_user_url = "/auth/user/"

    def test_current_user_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get(self.current_user_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["id"], self.user.id)

    def test_current_user_unauthenticated(self):
        response = self.client.get(self.current_user_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
