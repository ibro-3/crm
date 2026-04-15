from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Lead
from crm_companies.models import Company


def get_results(response):
    return response.data.get("results", response.data)


class LeadModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

    def test_lead_str_representation(self):
        lead = Lead.objects.create(user=self.user, first_name="John", last_name="Doe")
        self.assertEqual(str(lead), "John Doe")

    def test_lead_default_stage(self):
        lead = Lead.objects.create(user=self.user, first_name="John", last_name="Doe")
        self.assertEqual(lead.stage, "new")

    def test_lead_user_relationship(self):
        lead = Lead.objects.create(user=self.user, first_name="John", last_name="Doe")
        self.assertEqual(lead.user, self.user)


class LeadSerializerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_valid_lead_data(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "stage": "new",
            "source": "website",
        }
        from .serializers import LeadSerializer

        serializer = LeadSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_first_name_empty(self):
        data = {"first_name": "", "last_name": "Doe", "stage": "new"}
        from .serializers import LeadSerializer

        serializer = LeadSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("first_name", serializer.errors)

    def test_invalid_last_name_empty(self):
        data = {"first_name": "John", "last_name": "", "stage": "new"}
        from .serializers import LeadSerializer

        serializer = LeadSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("last_name", serializer.errors)

    def test_invalid_email_format(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "invalid-email",
            "stage": "new",
        }
        from .serializers import LeadSerializer

        serializer = LeadSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_invalid_phone_format(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "phone": "123",
            "stage": "new",
        }
        from .serializers import LeadSerializer

        serializer = LeadSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("phone", serializer.errors)

    def test_invalid_stage(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "stage": "invalid_stage",
        }
        from .serializers import LeadSerializer

        serializer = LeadSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("stage", serializer.errors)

    def test_invalid_source(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "stage": "new",
            "source": "invalid_source",
        }
        from .serializers import LeadSerializer

        serializer = LeadSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("source", serializer.errors)

    def test_valid_stages(self):
        from .serializers import LeadSerializer

        for stage in ["new", "contacted", "qualified", "won", "lost"]:
            data = {"first_name": "John", "last_name": "Doe", "stage": stage}
            serializer = LeadSerializer(data=data)
            self.assertTrue(serializer.is_valid(), f"Stage {stage} should be valid")

    def test_valid_sources(self):
        from .serializers import LeadSerializer

        for source in ["website", "referral", "social", "advertising", "other"]:
            data = {
                "first_name": "John",
                "last_name": "Doe",
                "stage": "new",
                "source": source,
            }
            serializer = LeadSerializer(data=data)
            self.assertTrue(serializer.is_valid(), f"Source {source} should be valid")


class LeadViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)
        self.lead = Lead.objects.create(
            user=self.user,
            first_name="John",
            last_name="Doe",
            email="john@test.com",
            stage="new",
        )
        self.other_lead = Lead.objects.create(
            user=self.other_user, first_name="Jane", last_name="Doe"
        )
        self.list_url = "/leads/"

    def test_list_leads(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)

    def test_list_leads_user_isolation(self):
        response = self.client.get(self.list_url)
        results = get_results(response)
        lead_ids = [l["id"] for l in results]
        self.assertNotIn(self.other_lead.id, lead_ids)

    def test_create_lead(self):
        data = {
            "first_name": "New",
            "last_name": "Lead",
            "email": "new@lead.com",
            "stage": "contacted",
        }
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["stage"], "contacted")

    def test_retrieve_lead(self):
        response = self.client.get(f"{self.list_url}{self.lead.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "John")

    def test_update_lead(self):
        data = {
            "first_name": "Updated",
            "last_name": "Name",
            "stage": "qualified",
        }
        response = self.client.put(
            f"{self.list_url}{self.lead.id}/", data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.stage, "qualified")

    def test_partial_update_lead(self):
        response = self.client.patch(
            f"{self.list_url}{self.lead.id}/", {"stage": "won"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.stage, "won")

    def test_delete_lead(self):
        response = self.client.delete(f"{self.list_url}{self.lead.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Lead.objects.filter(id=self.lead.id).exists())

    def test_search_leads(self):
        Lead.objects.create(
            user=self.user,
            first_name="Search",
            last_name="Lead",
            email="search@test.com",
        )
        response = self.client.get(self.list_url, {"search": "Search"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["first_name"], "Search")

    def test_filter_by_stage(self):
        Lead.objects.create(
            user=self.user, first_name="Qualified", last_name="Lead", stage="qualified"
        )
        Lead.objects.create(
            user=self.user, first_name="Contacted", last_name="Lead", stage="contacted"
        )
        response = self.client.get(self.list_url, {"stage": "qualified"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["stage"], "qualified")

    def test_company_filter(self):
        company = Company.objects.create(user=self.user, name="Test Company")
        Lead.objects.create(
            user=self.user,
            first_name="With",
            last_name="Company",
            company=company,
        )
        response = self.client.get(self.list_url, {"company": company.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)

    def test_unauthenticated_access(self):
        self.client.logout()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
