from datetime import date
from rest_framework import serializers
from .models import Deal


class DealSerializer(serializers.ModelSerializer):
    contact_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = [
            "id",
            "title",
            "value",
            "stage",
            "contact",
            "contact_name",
            "company",
            "company_name",
            "expected_close_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_contact_name(self, obj):
        if obj.contact:
            return f"{obj.contact.first_name} {obj.contact.last_name}"
        return None

    def get_company_name(self, obj):
        if obj.company:
            return obj.company.name
        return None

    def validate_title(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Title is required")
        if len(value) > 200:
            raise serializers.ValidationError("Title must be less than 200 characters")
        return value.strip()

    def validate_value(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Value must be a positive number")
        if value and value > 9999999999.99:
            raise serializers.ValidationError("Value exceeds maximum allowed")
        return value

    def validate_expected_close_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError(
                "Expected close date cannot be in the past"
            )
        return value

    def validate_stage(self, value):
        valid_stages = dict(Deal.STAGE_CHOICES)
        if value not in valid_stages:
            raise serializers.ValidationError(
                f"Invalid stage. Must be one of: {', '.join(valid_stages.keys())}"
            )
        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
