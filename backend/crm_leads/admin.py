from django.contrib import admin
from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = [
        "first_name",
        "last_name",
        "email",
        "company",
        "stage",
        "source",
        "created_at",
    ]
    list_filter = ["stage", "source", "company", "created_at"]
    search_fields = ["first_name", "last_name", "email", "company__name"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        (
            "Personal Information",
            {"fields": ("first_name", "last_name", "email", "phone")},
        ),
        ("Company", {"fields": ("company",)}),
        ("Lead Details", {"fields": ("stage", "source", "notes")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
