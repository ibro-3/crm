from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Task
from crm_contacts.models import Contact
from crm_deals.models import Deal


def get_results(response):
    return response.data.get("results", response.data)


class TaskModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

    def test_task_str_representation(self):
        task = Task.objects.create(user=self.user, title="Complete Report")
        self.assertEqual(str(task), "Complete Report")

    def test_task_default_status(self):
        task = Task.objects.create(user=self.user, title="Complete Report")
        self.assertEqual(task.status, "pending")

    def test_task_default_priority(self):
        task = Task.objects.create(user=self.user, title="Complete Report")
        self.assertEqual(task.priority, "medium")

    def test_task_user_relationship(self):
        task = Task.objects.create(user=self.user, title="Complete Report")
        self.assertEqual(task.user, self.user)


class TaskSerializerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_valid_task_data(self):
        data = {
            "title": "New Task",
            "description": "Complete this task",
            "status": "in_progress",
            "priority": "high",
            "due_date": str(date.today() + timedelta(days=7)),
        }
        from .serializers import TaskSerializer

        serializer = TaskSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_title_empty(self):
        data = {"title": "", "status": "pending"}
        from .serializers import TaskSerializer

        serializer = TaskSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_invalid_title_whitespace(self):
        data = {"title": "   ", "status": "pending"}
        from .serializers import TaskSerializer

        serializer = TaskSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_invalid_status(self):
        data = {"title": "Test Task", "status": "invalid_status"}
        from .serializers import TaskSerializer

        serializer = TaskSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("status", serializer.errors)

    def test_invalid_priority(self):
        data = {"title": "Test Task", "priority": "invalid_priority"}
        from .serializers import TaskSerializer

        serializer = TaskSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("priority", serializer.errors)

    def test_invalid_past_due_date(self):
        data = {
            "title": "Test Task",
            "due_date": str(date.today() - timedelta(days=1)),
        }
        from .serializers import TaskSerializer

        serializer = TaskSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("due_date", serializer.errors)

    def test_valid_statuses(self):
        from .serializers import TaskSerializer

        for status_val in ["pending", "in_progress", "completed"]:
            data = {"title": "Test Task", "status": status_val}
            serializer = TaskSerializer(data=data)
            self.assertTrue(
                serializer.is_valid(), f"Status {status_val} should be valid"
            )

    def test_valid_priorities(self):
        from .serializers import TaskSerializer

        for priority in ["low", "medium", "high"]:
            data = {"title": "Test Task", "priority": priority}
            serializer = TaskSerializer(data=data)
            self.assertTrue(
                serializer.is_valid(), f"Priority {priority} should be valid"
            )


class TaskViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)
        self.task = Task.objects.create(
            user=self.user, title="Test Task", status="pending", priority="high"
        )
        self.other_task = Task.objects.create(user=self.other_user, title="Other Task")
        self.list_url = "/tasks/"

    def test_list_tasks(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)

    def test_list_tasks_user_isolation(self):
        response = self.client.get(self.list_url)
        results = get_results(response)
        task_ids = [t["id"] for t in results]
        self.assertNotIn(self.other_task.id, task_ids)

    def test_create_task(self):
        data = {
            "title": "New Task",
            "status": "in_progress",
            "priority": "medium",
        }
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Task")

    def test_retrieve_task(self):
        response = self.client.get(f"{self.list_url}{self.task.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Task")

    def test_update_task(self):
        data = {
            "title": "Updated Task",
            "status": "completed",
            "priority": "low",
        }
        response = self.client.put(
            f"{self.list_url}{self.task.id}/", data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, "completed")

    def test_partial_update_task(self):
        response = self.client.patch(
            f"{self.list_url}{self.task.id}/", {"status": "in_progress"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, "in_progress")

    def test_delete_task(self):
        response = self.client.delete(f"{self.list_url}{self.task.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())

    def test_filter_by_status(self):
        Task.objects.create(user=self.user, title="Pending Task", status="pending")
        Task.objects.create(user=self.user, title="Completed Task", status="completed")
        response = self.client.get(self.list_url, {"status": "completed"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["status"], "completed")

    def test_filter_by_priority(self):
        Task.objects.create(user=self.user, title="Low Priority Task", priority="low")
        Task.objects.create(
            user=self.user, title="High Priority Task 2", priority="high"
        )
        response = self.client.get(self.list_url, {"priority": "low"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["priority"], "low")

    def test_contact_relationship(self):
        contact = Contact.objects.create(
            user=self.user, first_name="John", last_name="Doe"
        )
        task = Task.objects.create(
            user=self.user, title="Task for Contact", contact=contact
        )
        response = self.client.get(f"{self.list_url}{task.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_deal_relationship(self):
        deal = Deal.objects.create(user=self.user, title="Big Deal")
        task = Task.objects.create(user=self.user, title="Task for Deal", deal=deal)
        response = self.client.get(f"{self.list_url}{task.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_access(self):
        self.client.logout()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
