from datetime import date
from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source="contact", read_only=True)
    deal_title = serializers.CharField(source="deal", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "contact",
            "contact_name",
            "deal",
            "deal_title",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Title is required")
        if len(value) > 200:
            raise serializers.ValidationError("Title must be less than 200 characters")
        return value.strip()

    def validate_status(self, value):
        valid_statuses = dict(Task.STATUS_CHOICES)
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {', '.join(valid_statuses.keys())}"
            )
        return value

    def validate_priority(self, value):
        valid_priorities = dict(Task.PRIORITY_CHOICES)
        if value not in valid_priorities:
            raise serializers.ValidationError(
                f"Invalid priority. Must be one of: {', '.join(valid_priorities.keys())}"
            )
        return value

    def validate_due_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
