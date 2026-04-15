from django.db import models
from django.contrib.auth.models import User


class Lead(models.Model):
    STAGE_CHOICES = [
        ("new", "New"),
        ("contacted", "Contacted"),
        ("qualified", "Qualified"),
        ("won", "Won"),
        ("lost", "Lost"),
    ]
    SOURCE_CHOICES = [
        ("website", "Website"),
        ("referral", "Referral"),
        ("social", "Social Media"),
        ("advertising", "Advertising"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leads")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    company = models.ForeignKey(
        "crm_companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads",
    )
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default="new")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
