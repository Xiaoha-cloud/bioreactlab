from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from metabolic.utils import is_mixed_balanced
from .formula_utils import get_structure_from_formula

@api_view(['POST'])
def check_balance(request):
    """Check if a reaction is balanced using either SMILES or formulas."""
    try:
        reactants = request.data.get('reactants', [])
        products = request.data.get('products', [])
        
        if not reactants or not products:
            return Response(
                {'error': 'Both reactants and products are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        balanced, details = is_mixed_balanced(reactants, products)
        
        if isinstance(details, str):
            return Response(
                {'error': details},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'balanced': balanced,
            'reactant_counts': details.get('reactant_counts', {}) if not balanced else {},
            'product_counts': details.get('product_counts', {}) if not balanced else {}
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def generate_structure(request):
    """Generate molecular structure from chemical formula."""
    formula = request.data.get('formula')
    if not formula:
        return Response({'error': 'Formula is required'}, status=400)
        
    result = get_structure_from_formula(formula)
    if result is None:
        return Response({'error': 'Could not generate structure'}, status=400)
        
    return Response(result) 