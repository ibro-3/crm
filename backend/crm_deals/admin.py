from django.contrib import admin
from .models import Deal


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "value",
        "stage",
        "company",
        "contact",
        "expected_close_date",
        "created_at",
    ]
    list_filter = ["stage", "company", "expected_close_date", "created_at"]
    search_fields = [
        "title",
        "company__name",
        "contact__first_name",
        "contact__last_name",
    ]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        ("Deal Information", {"fields": ("title", "value", "stage")}),
        ("Associations", {"fields": ("contact", "company")}),
        ("Dates", {"fields": ("expected_close_date",)}),
        ("Additional", {"fields": ("notes",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
