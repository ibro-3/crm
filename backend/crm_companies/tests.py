from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Company


def get_results(response):
    return response.data.get("results", response.data)


class CompanyModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

    def test_company_str_representation(self):
        company = Company.objects.create(user=self.user, name="Acme Corp")
        self.assertEqual(str(company), "Acme Corp")

    def test_company_user_relationship(self):
        company = Company.objects.create(user=self.user, name="Acme Corp")
        self.assertEqual(company.user, self.user)


class CompanySerializerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_valid_company_data(self):
        data = {
            "name": "Acme Corp",
            "website": "https://www.acme.com",
            "email": "contact@acme.com",
            "phone": "+1-555-123-4567",
            "industry": "Technology",
        }
        from .serializers import CompanySerializer

        serializer = CompanySerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_name_empty(self):
        data = {"name": ""}
        from .serializers import CompanySerializer

        serializer = CompanySerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_invalid_name_whitespace(self):
        data = {"name": "   "}
        from .serializers import CompanySerializer

        serializer = CompanySerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_invalid_website_no_protocol(self):
        data = {"name": "Test Company", "website": "www.example.com"}
        from .serializers import CompanySerializer

        serializer = CompanySerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("website", serializer.errors)

    def test_invalid_email_format(self):
        data = {"name": "Test Company", "email": "invalid-email"}
        from .serializers import CompanySerializer

        serializer = CompanySerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_invalid_phone_format(self):
        data = {"name": "Test Company", "phone": "123"}
        from .serializers import CompanySerializer

        serializer = CompanySerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("phone", serializer.errors)

    def test_valid_website_formats(self):
        from .serializers import CompanySerializer

        valid_urls = [
            "http://example.com",
            "https://example.com",
            "https://www.example.com",
            "https://example.com/path",
        ]
        for url in valid_urls:
            data = {"name": "Test Company", "website": url}
            serializer = CompanySerializer(data=data)
            self.assertTrue(serializer.is_valid(), f"URL {url} should be valid")


class CompanyViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)
        self.company = Company.objects.create(
            user=self.user, name="Acme Corp", industry="Technology"
        )
        self.other_company = Company.objects.create(
            user=self.other_user, name="Other Corp"
        )
        self.list_url = "/companies/"

    def test_list_companies(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)

    def test_list_companies_user_isolation(self):
        response = self.client.get(self.list_url)
        results = get_results(response)
        company_ids = [c["id"] for c in results]
        self.assertNotIn(self.other_company.id, company_ids)

    def test_create_company(self):
        data = {
            "name": "New Company",
            "industry": "Finance",
            "website": "https://newcompany.com",
        }
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Company")

    def test_retrieve_company(self):
        response = self.client.get(f"{self.list_url}{self.company.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Acme Corp")

    def test_update_company(self):
        data = {
            "name": "Updated Company",
            "industry": "Healthcare",
        }
        response = self.client.put(
            f"{self.list_url}{self.company.id}/", data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertEqual(self.company.name, "Updated Company")
        self.assertEqual(self.company.industry, "Healthcare")

    def test_partial_update_company(self):
        response = self.client.patch(
            f"{self.list_url}{self.company.id}/", {"industry": "Retail"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertEqual(self.company.industry, "Retail")

    def test_delete_company(self):
        response = self.client.delete(f"{self.list_url}{self.company.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Company.objects.filter(id=self.company.id).exists())

    def test_search_companies(self):
        Company.objects.create(user=self.user, name="Searchable Corp", industry="Tech")
        response = self.client.get(self.list_url, {"search": "Searchable"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Searchable Corp")

    def test_ordering_companies(self):
        Company.objects.create(user=self.user, name="Zebra Inc")
        Company.objects.create(user=self.user, name="Alpha Corp")
        response = self.client.get(self.list_url, {"ordering": "name"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        names = [c["name"] for c in results]
        self.assertEqual(names, sorted(names))

    def test_filter_by_industry(self):
        Company.objects.create(user=self.user, name="Tech Corp", industry="Technology")
        Company.objects.create(user=self.user, name="Finance Corp", industry="Finance")
        response = self.client.get(self.list_url, {"search": "Technology"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_access(self):
        self.client.logout()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
