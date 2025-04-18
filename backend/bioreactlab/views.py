from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ReactionCreateSerializer, ReactionSerializer
from django.shortcuts import render, redirect
from .backend.bioreactlab.forms import MetaboliteForm
from .models import FormulaCache
import random

def mock_api_lookup(name):
    """Mock function to simulate external API lookup"""
    # This is a placeholder - in a real implementation, this would call an external API
    mock_formulas = {
        'glucose': 'C6H12O6',
        'water': 'H2O',
        'ethanol': 'C2H5OH',
        'methane': 'CH4',
        'carbon_dioxide': 'CO2'
    }
    formula = mock_formulas.get(name.lower())
    if formula:
        return {
            'name': name,
            'formula': formula,
            'source': 'external_api'
        }
    return None

@api_view(['GET'])
def formula_search(request):
    """
    Search for chemical formula by name.
    First checks local cache, then falls back to external API if needed.
    """
    search_term = request.GET.get('q', '').strip()
    if not search_term:
        return Response(
            {'error': 'Search term is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Try to find in local cache first
    try:
        cache_entry = FormulaCache.objects.get(name__iexact=search_term)
        cache_entry.save()  # This updates last_accessed due to auto_now=True
        return Response({
            'name': cache_entry.name,
            'formula': cache_entry.formula,
            'source': cache_entry.source
        })
    except FormulaCache.DoesNotExist:
        # If not found in cache, try external API
        result = mock_api_lookup(search_term)
        if result:
            # Cache the result for future use
            FormulaCache.objects.create(
                name=search_term,
                formula=result['formula'],
                source=result['source']
            )
            return Response(result)
        
        return Response(
            {'error': 'No formula found for the given name'},
            status=status.HTTP_404_NOT_FOUND
        )

def metabolite_input(request):
    if request.method == 'POST':
        form = MetaboliteForm(request.POST, request.FILES)
        if form.is_valid():
            metabolite = form.save(commit=False)
            # If no structure information is provided but a chemical formula is given
            if not metabolite.structure_file and not metabolite.inchi and not metabolite.smiles and metabolite.chemical_formula:
                # Placeholder: Add logic to generate structure information from chemical formula
                pass
            metabolite.save()
            return redirect('success_page')
    else:
        form = MetaboliteForm()
    return render(request, 'metabolite_input.html', {'form': form})
