from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "status",
        "priority",
        "due_date",
        "contact",
        "deal",
        "created_at",
    ]
    list_filter = ["status", "priority", "due_date", "created_at"]
    search_fields = [
        "title",
        "contact__first_name",
        "contact__last_name",
        "deal__title",
    ]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        ("Task Information", {"fields": ("title", "description")}),
        ("Status & Priority", {"fields": ("status", "priority", "due_date")}),
        ("Associations", {"fields": ("contact", "deal")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
