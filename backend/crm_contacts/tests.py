from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Contact
from crm_companies.models import Company


def get_results(response):
    return response.data.get("results", response.data)


class ContactModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

    def test_contact_str_representation(self):
        contact = Contact.objects.create(
            user=self.user, first_name="John", last_name="Doe"
        )
        self.assertEqual(str(contact), "John Doe")

    def test_contact_user_relationship(self):
        contact = Contact.objects.create(
            user=self.user, first_name="John", last_name="Doe"
        )
        self.assertEqual(contact.user, self.user)
        self.assertIn(contact, self.user.contacts.all())


class ContactSerializerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_valid_contact_data(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": "+1-555-123-4567",
        }
        from .serializers import ContactSerializer

        serializer = ContactSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_first_name_empty(self):
        data = {"first_name": "", "last_name": "Doe"}
        from .serializers import ContactSerializer

        serializer = ContactSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("first_name", serializer.errors)

    def test_invalid_first_name_whitespace(self):
        data = {"first_name": "   ", "last_name": "Doe"}
        from .serializers import ContactSerializer

        serializer = ContactSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_invalid_last_name_empty(self):
        data = {"first_name": "John", "last_name": ""}
        from .serializers import ContactSerializer

        serializer = ContactSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("last_name", serializer.errors)

    def test_invalid_email_format(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "invalid-email",
        }
        from .serializers import ContactSerializer

        serializer = ContactSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_invalid_phone_format(self):
        data = {"first_name": "John", "last_name": "Doe", "phone": "123"}
        from .serializers import ContactSerializer

        serializer = ContactSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("phone", serializer.errors)


class ContactViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)
        self.contact = Contact.objects.create(
            user=self.user, first_name="John", last_name="Doe", email="john@test.com"
        )
        self.other_contact = Contact.objects.create(
            user=self.other_user, first_name="Jane", last_name="Doe"
        )
        self.list_url = "/contacts/"

    def test_list_contacts(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["first_name"], "John")

    def test_list_contacts_user_isolation(self):
        response = self.client.get(self.list_url)
        results = get_results(response)
        contact_ids = [c["id"] for c in results]
        self.assertNotIn(self.other_contact.id, contact_ids)

    def test_create_contact(self):
        data = {
            "first_name": "New",
            "last_name": "Contact",
            "email": "new@contact.com",
        }
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["first_name"], "New")

    def test_retrieve_contact(self):
        response = self.client.get(f"{self.list_url}{self.contact.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "John")

    def test_update_contact(self):
        data = {"first_name": "Updated", "last_name": "Name"}
        response = self.client.put(
            f"{self.list_url}{self.contact.id}/", data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.contact.refresh_from_db()
        self.assertEqual(self.contact.first_name, "Updated")

    def test_partial_update_contact(self):
        response = self.client.patch(
            f"{self.list_url}{self.contact.id}/",
            {"first_name": "Patched"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.contact.refresh_from_db()
        self.assertEqual(self.contact.first_name, "Patched")

    def test_delete_contact(self):
        response = self.client.delete(f"{self.list_url}{self.contact.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Contact.objects.filter(id=self.contact.id).exists())

    def test_search_contacts(self):
        Contact.objects.create(
            user=self.user,
            first_name="Search",
            last_name="Test",
            email="search@test.com",
        )
        response = self.client.get(self.list_url, {"search": "Search"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["first_name"], "Search")

    def test_ordering_contacts(self):
        Contact.objects.create(user=self.user, first_name="Alice", last_name="Smith")
        Contact.objects.create(user=self.user, first_name="Bob", last_name="Smith")
        response = self.client.get(self.list_url, {"ordering": "first_name"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        first_names = [c["first_name"] for c in results]
        self.assertEqual(first_names, sorted(first_names))

    def test_unauthenticated_access(self):
        self.client.logout()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_company_filter(self):
        company = Company.objects.create(user=self.user, name="Test Company")
        Contact.objects.create(
            user=self.user, first_name="With", last_name="Company", company=company
        )
        Contact.objects.create(
            user=self.user, first_name="Without", last_name="Company"
        )
        response = self.client.get(self.list_url, {"company": company.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["first_name"], "With")
