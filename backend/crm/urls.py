from django.urls import path, include
from rest_framework.routers import DefaultRouter
from crm_contacts.views import ContactViewSet
from crm_leads.views import LeadViewSet
from crm_deals.views import DealViewSet
from crm_tasks.views import TaskViewSet
from crm_companies.views import CompanyViewSet
from .auth import views as auth_views

router = DefaultRouter()
router.register(r"contacts", ContactViewSet)
router.register(r"leads", LeadViewSet)
router.register(r"deals", DealViewSet)
router.register(r"tasks", TaskViewSet)
router.register(r"companies", CompanyViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/auth/login/", auth_views.login_view, name="login"),
    path("api/auth/logout/", auth_views.logout_view, name="logout"),
    path("api/auth/user/", auth_views.current_user_view, name="current_user"),
]
