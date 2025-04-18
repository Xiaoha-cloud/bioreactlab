from rest_framework import serializers

class MetaboliteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    stoichiometry = serializers.FloatField()
    compartment = serializers.CharField(max_length=50)
    type = serializers.CharField(max_length=50)
    formula = serializers.CharField(max_length=255, required=False)
    charge = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False)

    def validate_stoichiometry(self, value):
        if value <= 0:
            raise serializers.ValidationError("Stoichiometry must be positive")
        return value

    def validate_compartment(self, value):
        valid_compartments = ['cytosol', 'mitochondria', 'nucleus', 'extracellular']
        if value not in valid_compartments:
            raise serializers.ValidationError(f"Invalid compartment. Must be one of {valid_compartments}")
        return value

    def validate_type(self, value):
        valid_types = ['metabolite', 'protein', 'rna', 'dna']
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid type. Must be one of {valid_types}")
        return value 