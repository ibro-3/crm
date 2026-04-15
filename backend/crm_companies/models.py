from django.db import models
from django.contrib.auth.models import User


class Company(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="companies")
    name = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
