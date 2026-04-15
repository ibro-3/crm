from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Deal
from .serializers import DealSerializer


class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = DealSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "notes"]
    ordering_fields = ["title", "value", "stage", "expected_close_date", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Deal.objects.filter(user=self.request.user)

        search_query = self.request.query_params.get("search", None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | Q(notes__icontains=search_query)
            )

        stage = self.request.query_params.get("stage", None)
        if stage:
            queryset = queryset.filter(stage=stage)

        company_id = self.request.query_params.get("company", None)
        if company_id:
            queryset = queryset.filter(company_id=company_id)

        contact_id = self.request.query_params.get("contact", None)
        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)

        min_value = self.request.query_params.get("min_value", None)
        if min_value:
            queryset = queryset.filter(value__gte=min_value)

        max_value = self.request.query_params.get("max_value", None)
        if max_value:
            queryset = queryset.filter(value__lte=max_value)

        return queryset
