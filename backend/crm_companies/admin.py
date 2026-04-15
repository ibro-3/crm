from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["name", "industry", "email", "phone", "created_at"]
    list_filter = ["industry", "created_at"]
    search_fields = ["name", "email", "phone", "industry"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        ("Company Information", {"fields": ("name", "industry", "website")}),
        ("Contact Details", {"fields": ("email", "phone", "address")}),
        ("Additional", {"fields": ("notes",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
