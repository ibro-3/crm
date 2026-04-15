from django.contrib import admin
from .models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "company",
        "created_at",
    ]
    list_filter = ["company", "created_at"]
    search_fields = ["first_name", "last_name", "email", "phone"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        (
            "Personal Information",
            {"fields": ("first_name", "last_name", "email", "phone")},
        ),
        ("Company", {"fields": ("company",)}),
        ("Additional", {"fields": ("address", "notes")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
