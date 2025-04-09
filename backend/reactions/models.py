from django.db import models
from django.utils import timezone

class Reaction(models.Model):
    ATOM_MAPPING_CHOICES = [
        ('PENDING', 'Pending'),
        ('SKIPPED', 'Skipped'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    ]
    
    reaction_id = models.CharField(max_length=50, unique=True)
    direction = models.CharField(max_length=10)
    skip_atom_mapping = models.BooleanField(default=False)
    atom_mapping = models.CharField(
        max_length=20,
        choices=ATOM_MAPPING_CHOICES,
        default='PENDING'
    )
    mass_balanced = models.BooleanField(default=False)
    charge_balanced = models.BooleanField(default=False)
    subsystem = models.CharField(max_length=100)
    organ = models.CharField(max_length=50)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.reaction_id

class ReactionMetabolite(models.Model):
    ROLE_CHOICES = [
        ('substrate', 'Substrate'),
        ('product', 'Product')
    ]
    
    name = models.CharField(max_length=100)
    stoichiometry = models.FloatField()
    compartment = models.CharField(max_length=10)
    type = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    reaction = models.ForeignKey(Reaction, on_delete=models.CASCADE, related_name='metabolites')

    def __str__(self):
        return f"{self.name} ({self.role})"
