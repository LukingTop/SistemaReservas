from rest_framework import serializers
from .models import Recurso, Reserva
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.models import User


class RecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurso
        fields = '__all__'


class ReservaSerializer(serializers.ModelSerializer):
    recurso_nome = serializers.CharField(source='recurso.nome', read_only=True)
    
    class Meta:
        model = Reserva
        fields = ['id', 'recurso', 'recurso_nome', 'data_hora_inicio', 'data_hora_fim', 'motivo']

    def validate(self, data):
        instance = Reserva(**data)
        
        try:
            instance.clean()
        except DjangoValidationError as e:
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            else:
                raise serializers.ValidationError(e.messages)
        
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user