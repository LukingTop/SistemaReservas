from rest_framework import serializers
from .models import Recurso, Reserva, CodigoConvite
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password 

class RecursoSerializer(serializers.ModelSerializer):
    """
    Serializa o modelo Recurso.
    Transforma objetos do banco em JSON e valida tipos de dados básicos.
    """
    class Meta:
        model = Recurso
        fields = '__all__'


class ReservaSerializer(serializers.ModelSerializer):
    # Campo calculado (read-only) para facilitar a exibição no frontend sem requisições extras
    recurso_nome = serializers.CharField(source='recurso.nome', read_only=True)
    
    class Meta:
        model = Reserva
        fields = ['id', 'recurso', 'recurso_nome', 'data_hora_inicio', 'data_hora_fim', 'motivo', 'status']

    def validate(self, data):
        """
        Validação Centralizada:
        Ao invés de reescrever a lógica de conflito de horários aqui, instanciamos o modelo
        e chamamos o método .clean().
        
        Isso garante o princípio DRY (Don't Repeat Yourself), mantendo a regra de negócio
        exclusivamente no Model (models.py), servindo tanto para o Admin do Django quanto para a API.
        """
        instance = Reserva(**data)
        
        try:
            instance.clean() # Dispara a verificação de conflito de horário definida no Model
        except DjangoValidationError as e:
            # Converte o erro do Model (Django puro) para um erro de API (DRF JSON)
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            else:
                raise serializers.ValidationError(e.messages)
        
        return data


class UserSerializer(serializers.ModelSerializer):
    # Campo 'write_only' para o código de convite: não é salvo no User, apenas processado na criação
    admin_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Força o e-mail a ser obrigatório na API, mesmo que no Django User padrão seja opcional
    email = serializers.EmailField(required=True) 

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'admin_code']
        # Garante que a senha nunca seja retornada em respostas de API (hash security)
        extra_kwargs = {'password': {'write_only': True}}

    
    def validate(self, data):
        """
        Camada de Segurança e Validação de Dados.
        """
        email = data.get('email')
        
        # Garante unicidade do e-mail (regra de negócio do sistema)
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Este endereço de e-mail já está em uso."})

        # Validação de Força de Senha
        password = data.get('password')
        if password:
            try:
                # Utiliza os validadores configurados no settings.py (ex: tamanho mínimo, não ser comum)
                validate_password(password)
            except DjangoValidationError as e:
                # Retorna erros detalhados (ex: "A senha é muito curta") para o frontend
                raise serializers.ValidationError({"password": e.messages})

        return data

    def create(self, validated_data):
        """
        Sobrescrita do método de criação para implementar a lógica de 'Código de Convite'.
        Permite a elevação de privilégios segura durante o registro.
        """
        # Remove o admin_code dos dados antes de criar o usuário, pois ele não é um campo do User model
        admin_code = validated_data.pop('admin_code', None)
        
        # Cria o usuário com criptografia de senha (create_user faz o hash automático)
        user = User.objects.create_user(**validated_data)
        
        # Lógica de Elevação de Privilégio
        if admin_code:
            try:
                # Verifica se o código existe e ainda não foi usado
                convite = CodigoConvite.objects.get(codigo=admin_code, usado=False)
                
                # Se válido, promove o usuário a Staff/Superuser
                user.is_staff = True
                user.is_superuser = True
                user.save()
                
                # Queima o código para evitar reuso
                convite.usado = True
                convite.usado_por = user
                convite.save()
            except CodigoConvite.DoesNotExist:
                # Decisão de projeto: Se o código for inválido, criamos o usuário como comum
                # sem lançar erro, apenas ignorando a promoção.
                pass
            
        return user