import re
from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "website",
            "phone",
            "email",
            "address",
            "industry",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Company name is required")
        if len(value) > 200:
            raise serializers.ValidationError(
                "Company name must be less than 200 characters"
            )
        return value.strip()

    def validate_website(self, value):
        if value:
            url_regex = r"^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$"
            if not re.match(url_regex, value):
                raise serializers.ValidationError(
                    "Invalid URL format. Must start with http:// or https://"
                )
        return value

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

    def validate_industry(self, value):
        if value and len(value) > 100:
            raise serializers.ValidationError(
                "Industry must be less than 100 characters"
            )
        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
