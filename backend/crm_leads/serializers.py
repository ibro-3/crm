import re
from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "company",
            "company_name",
            "stage",
            "source",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_first_name(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("First name is required")
        if len(value) > 100:
            raise serializers.ValidationError(
                "First name must be less than 100 characters"
            )
        return value.strip()

    def validate_last_name(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Last name is required")
        if len(value) > 100:
            raise serializers.ValidationError(
                "Last name must be less than 100 characters"
            )
        return value.strip()

    def validate_email(self, value):
        if value:
            email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_regex, value):
                raise serializers.ValidationError("Invalid email format")
        return value

    def validate_phone(self, value):
        if value:
            phone_regex = r"^[\d\s\-\+\(\)]{7,20}$"
            if not re.match(phone_regex, value):
                raise serializers.ValidationError("Invalid phone format (7-20 digits)")
        return value

    def validate_stage(self, value):
        valid_stages = dict(Lead.STAGE_CHOICES)
        if value not in valid_stages:
            raise serializers.ValidationError(
                f"Invalid stage. Must be one of: {', '.join(valid_stages.keys())}"
            )
        return value

    def validate_source(self, value):
        if value:
            valid_sources = dict(Lead.SOURCE_CHOICES)
            if value not in valid_sources:
                raise serializers.ValidationError(
                    f"Invalid source. Must be one of: {', '.join(valid_sources.keys())}"
                )
        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
