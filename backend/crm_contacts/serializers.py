import re
from rest_framework import serializers
from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Contact
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
            "notes",
            "company",
            "company_name",
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

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
