from django.db import models
from django.contrib.auth.models import User


class Deal(models.Model):
    STAGE_CHOICES = [
        ("prospecting", "Prospecting"),
        ("qualification", "Qualification"),
        ("proposal", "Proposal"),
        ("negotiation", "Negotiation"),
        ("closed_won", "Closed Won"),
        ("closed_lost", "Closed Lost"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="deals")
    title = models.CharField(max_length=200)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stage = models.CharField(
        max_length=20, choices=STAGE_CHOICES, default="prospecting"
    )
    contact = models.ForeignKey(
        "crm_contacts.Contact",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
    )
    company = models.ForeignKey(
        "crm_companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
    )
    expected_close_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
