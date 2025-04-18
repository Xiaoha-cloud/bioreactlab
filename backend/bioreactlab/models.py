from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Metabolite(models.Model):
    name = models.CharField(max_length=255)
    structure_file = models.FileField(upload_to='structures/', blank=True, null=True)
    inchi = models.TextField(blank=True, null=True)
    smiles = models.TextField(blank=True, null=True)
    chemical_formula = models.CharField(max_length=255, blank=True, null=True)
    # New fields
    is_approved = models.BooleanField(default=False, help_text='Indicates whether the metabolite has been approved by an administrator')
    last_modified = models.DateTimeField(auto_now=True, help_text='Automatically updated timestamp of the last modification')
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, help_text='User who created this metabolite')

    def __str__(self):
        return f"{self.name} ({'Approved' if self.is_approved else 'Pending'})"

class FormulaCache(models.Model):
    name = models.CharField(max_length=255, unique=True)
    formula = models.CharField(max_length=255)
    source = models.CharField(max_length=50, default='local')
    created_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}: {self.formula}"

    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

class FormulaAuditLog(models.Model):
    """Model for tracking changes to chemical formulas."""
    metabolite = models.ForeignKey(Metabolite, on_delete=models.CASCADE, related_name='formula_changes')
    old_formula = models.CharField(max_length=255, null=True, blank=True)
    new_formula = models.CharField(max_length=255)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['metabolite', 'changed_at']),
        ]

    def __str__(self):
        return f"{self.metabolite.name} formula change at {self.changed_at}"
