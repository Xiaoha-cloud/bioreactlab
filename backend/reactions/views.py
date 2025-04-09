from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Reaction, ReactionMetabolite
from datetime import datetime

# Create your views here.

@api_view(['POST'])
def create_reaction(request):
    try:
        # Extract data from request
        data = request.data
        substrates = data.get('substrates', [])
        products = data.get('products', [])
        direction = data.get('direction', '->')
        skip_atom_mapping = data.get('skipAtomMapping', False)
        subsystem = data.get('subsystem', '')
        organ = data.get('organ', '')

        # Generate reaction ID
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        reaction_id = f"rxn_{timestamp}"

        # Create reaction
        reaction = Reaction.objects.create(
            reaction_id=reaction_id,
            direction=direction,
            skip_atom_mapping=skip_atom_mapping,
            atom_mapping='SKIPPED' if skip_atom_mapping else 'PENDING',
            mass_balanced=True,  # This should be calculated based on actual data
            charge_balanced=True,  # This should be calculated based on actual data
            subsystem=subsystem,
            organ=organ,
            created_at=timezone.now()
        )

        # Create substrates
        for substrate in substrates:
            ReactionMetabolite.objects.create(
                name=substrate['name'],
                stoichiometry=float(substrate['stoichiometry']),
                compartment=substrate['compartment'],
                type=substrate['type'],
                role='substrate',
                reaction=reaction
            )

        # Create products
        for product in products:
            ReactionMetabolite.objects.create(
                name=product['name'],
                stoichiometry=float(product['stoichiometry']),
                compartment=product['compartment'],
                type=product['type'],
                role='product',
                reaction=reaction
            )

        # Prepare response
        response_data = {
            'reactionId': reaction_id,
            'status': 'created',
            'atomMapping': 'SKIPPED' if skip_atom_mapping else 'PENDING',
            'massBalanced': True,
            'chargeBalanced': True,
            'message': 'Reaction created successfully.'
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
