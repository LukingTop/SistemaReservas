from rest_framework import serializers
from .models import Recurso, Reserva, CodigoConvite
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password 


class RecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurso
        fields = '__all__'


class ReservaSerializer(serializers.ModelSerializer):
    recurso_nome = serializers.CharField(source='recurso.nome', read_only=True)
    
    class Meta:
        model = Reserva
        fields = ['id', 'recurso', 'recurso_nome', 'data_hora_inicio', 'data_hora_fim', 'motivo', 'status']

    def validate(self, data):
        """
        Chama o método clean() do Model para validação de conflitos.
        """
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
    admin_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
   
    email = serializers.EmailField(required=True) 

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'admin_code']
        extra_kwargs = {'password': {'write_only': True}}

    
    def validate(self, data):
     
        email = data.get('email')
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Este endereço de e-mail já está em uso."})

        
        password = data.get('password')
        if password:
            try:
                
                validate_password(password)
            except DjangoValidationError as e:
              
                raise serializers.ValidationError({"password": e.messages})

        return data

    def create(self, validated_data):
       
        admin_code = validated_data.pop('admin_code', None)
        
        user = User.objects.create_user(**validated_data)
        
        if admin_code:
            try:
                convite = CodigoConvite.objects.get(codigo=admin_code, usado=False)
                user.is_staff = True
                user.is_superuser = True
                user.save()
                
                convite.usado = True
                convite.usado_por = user
                convite.save()
            except CodigoConvite.DoesNotExist:
                pass
            
        return user