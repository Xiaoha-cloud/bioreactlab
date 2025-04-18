from django import forms
from .models import Metabolite

class MetaboliteForm(forms.ModelForm):
    chemical_formula = forms.CharField(required=False, max_length=255, label='Chemical Formula')

    class Meta:
        model = Metabolite
        fields = ['name', 'structure_file', 'inchi', 'smiles', 'chemical_formula']
