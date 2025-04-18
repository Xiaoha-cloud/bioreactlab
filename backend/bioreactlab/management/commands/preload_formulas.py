import csv
import os
from django.core.management.base import BaseCommand
from tqdm import tqdm
from bioreactlab.models import FormulaCache
from bioreactlab.services.formula_validator import FormulaValidator

class Command(BaseCommand):
    help = 'Preload chemical formulas from metabolites.csv into FormulaCache'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='metabolites.csv',
            help='Path to the CSV file containing metabolite data'
        )
        parser.add_argument(
            '--validate',
            action='store_true',
            help='Validate formulas using RDKit before saving'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        validate = options['validate']

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        try:
            with open(file_path, 'r') as csvfile:
                # Count total rows for progress bar
                total_rows = sum(1 for _ in csvfile) - 1  # Subtract header row
                csvfile.seek(0)  # Reset file pointer

                reader = csv.DictReader(csvfile)
                created_count = 0
                skipped_count = 0
                invalid_count = 0

                with tqdm(total=total_rows, desc='Loading formulas') as pbar:
                    for row in reader:
                        name = row.get('name', '').strip()
                        formula = row.get('formula', '').strip()

                        if not name or not formula:
                            invalid_count += 1
                            pbar.update(1)
                            continue

                        # Skip if formula already exists
                        if FormulaCache.objects.filter(name__iexact=name).exists():
                            skipped_count += 1
                            pbar.update(1)
                            continue

                        # Validate formula if requested
                        if validate:
                            is_valid, error = FormulaValidator.validate_with_rdkit(formula)
                            if not is_valid:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f'Invalid formula for {name}: {error}'
                                    )
                                )
                                invalid_count += 1
                                pbar.update(1)
                                continue

                        # Create new FormulaCache entry
                        FormulaCache.objects.create(
                            name=name,
                            formula=formula,
                            source='preloaded'
                        )
                        created_count += 1
                        pbar.update(1)

            # Print summary
            self.stdout.write(self.style.SUCCESS(
                f'\nPreload complete:\n'
                f'Created: {created_count}\n'
                f'Skipped (duplicates): {skipped_count}\n'
                f'Invalid: {invalid_count}'
            ))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error processing file: {str(e)}')) 