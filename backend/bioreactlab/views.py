from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ReactionCreateSerializer, ReactionSerializer

@api_view(['POST'])
def create_reaction(request):
    serializer = ReactionCreateSerializer(data=request.data)
    if serializer.is_valid():
        reaction = serializer.save()
        response_data = {
            'reactionId': reaction.reaction_id,
            'status': 'created',
            'atomMapping': reaction.atom_mapping,
            'massBalanced': reaction.mass_balanced,
            'chargeBalanced': reaction.charge_balanced,
            'message': 'Reaction created successfully.'
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 