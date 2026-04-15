from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Company
from .serializers import CompanySerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "email", "phone", "industry"]
    ordering_fields = ["name", "industry", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Company.objects.filter(user=self.request.user)

        search_query = self.request.query_params.get("search", None)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(email__icontains=search_query)
                | Q(phone__icontains=search_query)
                | Q(industry__icontains=search_query)
            )

        industry = self.request.query_params.get("industry", None)
        if industry:
            queryset = queryset.filter(industry__icontains=industry)

        return queryset
