from rest_framework import serializers
from .models import Reaction, ReactionMetabolite

class ReactionMetaboliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReactionMetabolite
        fields = ['name', 'stoichiometry', 'compartment', 'type', 'role']

class ReactionSerializer(serializers.ModelSerializer):
    metabolites = ReactionMetaboliteSerializer(many=True, required=False)
    
    class Meta:
        model = Reaction
        fields = ['reaction_id', 'direction', 'skip_atom_mapping', 'atom_mapping',
                 'mass_balanced', 'charge_balanced', 'subsystem', 'organ',
                 'created_at', 'metabolites']
        read_only_fields = ['reaction_id', 'atom_mapping', 'mass_balanced',
                          'charge_balanced', 'created_at']

class ReactionCreateSerializer(serializers.Serializer):
    substrates = ReactionMetaboliteSerializer(many=True)
    products = ReactionMetaboliteSerializer(many=True)
    direction = serializers.CharField()
    skipAtomMapping = serializers.BooleanField()
    subsystem = serializers.CharField()
    organ = serializers.CharField()

    def create(self, validated_data):
        # Generate reaction ID
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        reaction_id = f"rxn_{timestamp}"
        
        # Create reaction
        reaction = Reaction.objects.create(
            reaction_id=reaction_id,
            direction=validated_data['direction'],
            skip_atom_mapping=validated_data['skipAtomMapping'],
            subsystem=validated_data['subsystem'],
            organ=validated_data['organ'],
            atom_mapping='SKIPPED' if validated_data['skipAtomMapping'] else 'PENDING',
            mass_balanced=True,  # This should be calculated based on actual data
            charge_balanced=True  # This should be calculated based on actual data
        )
        
        # Create metabolites
        for substrate in validated_data['substrates']:
            ReactionMetabolite.objects.create(
                reaction=reaction,
                role='substrate',
                **substrate
            )
            
        for product in validated_data['products']:
            ReactionMetabolite.objects.create(
                reaction=reaction,
                role='product',
                **product
            )
            
        return reaction 