from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["first_name", "last_name", "email", "phone"]
    ordering_fields = ["first_name", "last_name", "stage", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Lead.objects.filter(user=self.request.user)

        search_query = self.request.query_params.get("search", None)
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query)
                | Q(last_name__icontains=search_query)
                | Q(email__icontains=search_query)
            )

        stage = self.request.query_params.get("stage", None)
        if stage:
            queryset = queryset.filter(stage=stage)

        company_id = self.request.query_params.get("company", None)
        if company_id:
            queryset = queryset.filter(company_id=company_id)

        source = self.request.query_params.get("source", None)
        if source:
            queryset = queryset.filter(source=source)

        return queryset
