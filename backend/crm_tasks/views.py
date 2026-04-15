from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "status", "priority", "due_date", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)

        search_query = self.request.query_params.get("search", None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query)
                | Q(description__icontains=search_query)
            )

        status = self.request.query_params.get("status", None)
        if status:
            queryset = queryset.filter(status=status)

        priority = self.request.query_params.get("priority", None)
        if priority:
            queryset = queryset.filter(priority=priority)

        contact_id = self.request.query_params.get("contact", None)
        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)

        deal_id = self.request.query_params.get("deal", None)
        if deal_id:
            queryset = queryset.filter(deal_id=deal_id)

        return queryset
