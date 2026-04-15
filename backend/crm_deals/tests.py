from datetime import date, timedelta
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Deal
from crm_companies.models import Company
from crm_contacts.models import Contact


def get_results(response):
    return response.data.get("results", response.data)


class DealModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

    def test_deal_str_representation(self):
        deal = Deal.objects.create(user=self.user, title="Big Sale")
        self.assertEqual(str(deal), "Big Sale")

    def test_deal_default_stage(self):
        deal = Deal.objects.create(user=self.user, title="Big Sale")
        self.assertEqual(deal.stage, "prospecting")

    def test_deal_default_value(self):
        deal = Deal.objects.create(user=self.user, title="Big Sale")
        self.assertEqual(deal.value, Decimal("0"))

    def test_deal_user_relationship(self):
        deal = Deal.objects.create(user=self.user, title="Big Sale")
        self.assertEqual(deal.user, self.user)


class DealSerializerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_valid_deal_data(self):
        data = {
            "title": "New Deal",
            "value": "50000.00",
            "stage": "proposal",
            "expected_close_date": str(date.today() + timedelta(days=30)),
        }
        from .serializers import DealSerializer

        serializer = DealSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_title_empty(self):
        data = {"title": "", "stage": "prospecting"}
        from .serializers import DealSerializer

        serializer = DealSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_invalid_title_whitespace(self):
        data = {"title": "   ", "stage": "prospecting"}
        from .serializers import DealSerializer

        serializer = DealSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_invalid_negative_value(self):
        data = {"title": "Test Deal", "value": "-100"}
        from .serializers import DealSerializer

        serializer = DealSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("value", serializer.errors)

    def test_invalid_past_close_date(self):
        data = {
            "title": "Test Deal",
            "expected_close_date": str(date.today() - timedelta(days=1)),
        }
        from .serializers import DealSerializer

        serializer = DealSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("expected_close_date", serializer.errors)

    def test_invalid_stage(self):
        data = {"title": "Test Deal", "stage": "invalid_stage"}
        from .serializers import DealSerializer

        serializer = DealSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("stage", serializer.errors)

    def test_valid_stages(self):
        from .serializers import DealSerializer

        for stage in [
            "prospecting",
            "qualification",
            "proposal",
            "negotiation",
            "closed_won",
            "closed_lost",
        ]:
            data = {"title": "Test Deal", "stage": stage}
            serializer = DealSerializer(data=data)
            self.assertTrue(serializer.is_valid(), f"Stage {stage} should be valid")


class DealViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)
        self.deal = Deal.objects.create(
            user=self.user,
            title="Test Deal",
            value=Decimal("10000.00"),
            stage="prospecting",
        )
        self.other_deal = Deal.objects.create(user=self.other_user, title="Other Deal")
        self.list_url = "/deals/"

    def test_list_deals(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)

    def test_list_deals_user_isolation(self):
        response = self.client.get(self.list_url)
        results = get_results(response)
        deal_ids = [d["id"] for d in results]
        self.assertNotIn(self.other_deal.id, deal_ids)

    def test_create_deal(self):
        data = {
            "title": "New Deal",
            "value": "25000.00",
            "stage": "qualification",
        }
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Deal")

    def test_retrieve_deal(self):
        response = self.client.get(f"{self.list_url}{self.deal.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Deal")

    def test_update_deal(self):
        data = {
            "title": "Updated Deal",
            "stage": "proposal",
            "value": "15000.00",
        }
        response = self.client.put(
            f"{self.list_url}{self.deal.id}/", data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deal.refresh_from_db()
        self.assertEqual(self.deal.title, "Updated Deal")
        self.assertEqual(self.deal.value, Decimal("15000.00"))

    def test_partial_update_deal(self):
        response = self.client.patch(
            f"{self.list_url}{self.deal.id}/", {"stage": "closed_won"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deal.refresh_from_db()
        self.assertEqual(self.deal.stage, "closed_won")

    def test_delete_deal(self):
        response = self.client.delete(f"{self.list_url}{self.deal.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Deal.objects.filter(id=self.deal.id).exists())

    def test_filter_by_stage(self):
        Deal.objects.create(user=self.user, title="Won Deal", stage="closed_won")
        Deal.objects.create(user=self.user, title="Lost Deal", stage="closed_lost")
        response = self.client.get(self.list_url, {"stage": "closed_won"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["stage"], "closed_won")

    def test_contact_relationship(self):
        contact = Contact.objects.create(
            user=self.user, first_name="John", last_name="Doe"
        )
        deal = Deal.objects.create(
            user=self.user, title="Deal with Contact", contact=contact
        )
        response = self.client.get(f"{self.list_url}{deal.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("contact_name", response.data)

    def test_company_relationship(self):
        company = Company.objects.create(user=self.user, name="Big Corp")
        deal = Deal.objects.create(
            user=self.user, title="Deal with Company", company=company
        )
        response = self.client.get(f"{self.list_url}{deal.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("company_name", response.data)

    def test_unauthenticated_access(self):
        self.client.logout()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
