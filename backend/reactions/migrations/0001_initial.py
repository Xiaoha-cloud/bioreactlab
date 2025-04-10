# Generated by Django 4.2.20 on 2025-04-09 15:52

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Reaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reaction_id', models.CharField(max_length=50, unique=True)),
                ('direction', models.CharField(max_length=10)),
                ('skip_atom_mapping', models.BooleanField(default=False)),
                ('atom_mapping', models.CharField(choices=[('PENDING', 'Pending'), ('SKIPPED', 'Skipped'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed')], default='PENDING', max_length=20)),
                ('mass_balanced', models.BooleanField(default=False)),
                ('charge_balanced', models.BooleanField(default=False)),
                ('subsystem', models.CharField(max_length=100)),
                ('organ', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.CreateModel(
            name='ReactionMetabolite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('stoichiometry', models.FloatField()),
                ('compartment', models.CharField(max_length=10)),
                ('type', models.CharField(max_length=50)),
                ('role', models.CharField(choices=[('substrate', 'Substrate'), ('product', 'Product')], max_length=20)),
                ('reaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metabolites', to='reactions.reaction')),
            ],
        ),
    ]
