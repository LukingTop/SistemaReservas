from rest_framework import serializers
from .models import Recurso, Reserva, CodigoConvite
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password 

class RecursoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Recurso (Salas).
    Converte os objetos do banco para JSON e vice-versa.
    """
    class Meta:
        model = Recurso
        fields = '__all__'


class ReservaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Reserva.
    Inclui validação personalizada para garantir que não haja conflitos de horário.
    """
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
        # Cria uma instância temporária com os dados recebidos (sem salvar no banco ainda)
        instance = Reserva(**data)
        
        try:
            instance.clean() # Dispara a verificação de conflito de horário definida no Model
        except DjangoValidationError as e:
            # Converte o erro do Model (Django puro) para um erro de API (DRF JSON)
            # Isso garante que o Frontend receba um erro 400 legível
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            else:
                raise serializers.ValidationError(e.messages)
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de usuários.
    Gerencia a validação de segurança (senha forte) e a lógica de convite para Admins.
    """
    # Campo 'write_only' para o código de convite: não é salvo no User, apenas processado na criação
    admin_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Força o e-mail a ser obrigatório na API, mesmo que no Django User padrão seja opcional
    email = serializers.EmailField(required=True) 

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'admin_code']
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
                # Utiliza os validadores configurados no settings.py
                validate_password(password)
            except DjangoValidationError as e:
                # Retorna erros detalhados para o frontend
                raise serializers.ValidationError({"password": e.messages})


        
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()

        
        if first_name and last_name:
            if first_name.lower() == last_name.lower():
                raise serializers.ValidationError({
                    "last_name": "O sobrenome não pode ser igual ao nome."
                })
            
        return data

    def create(self, validated_data):
        """
        Sobrescrita do método de criação para implementar a lógica de 'Código de Convite'.
        Permite a elevação de privilégios segura durante o registro.
        """
        # Remove o admin_code dos dados antes de criar o usuário, pois ele não é um campo do User model
        admin_code = validated_data.pop('admin_code', None)
        
        # Cria o usuário com criptografia de senha 
        user = User.objects.create_user(**validated_data)
        
        # Lógica de Elevação de Privilégio
        if admin_code:
            try:
                # Verifica se o código existe e ainda não foi usado no banco de dados
                convite = CodigoConvite.objects.get(codigo=admin_code, usado=False)
                
                # Se válido, promove o usuário a Staff/Superuser
                user.is_staff = True
                user.is_superuser = True
                user.save()
                
                # Invalida o token para evitar reuso (Segurança)
                convite.usado = True
                convite.usado_por = user
                convite.save()
            except CodigoConvite.DoesNotExist:
                # Falha silenciosa: cria como usuário comum se o código for inválido
                pass
            
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer específico para edição de perfil.
    Permite alterar nome e email sem exigir a senha novamente.
    """
    class Meta:
        model = User
        # Liberamos a edição de Nome, Sobrenome e Email
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        # Username não deve ser mudado para não quebrar login
        read_only_fields = ['id', 'username'] 

    def validate_email(self, value):
        """
        Validação personalizada para permitir manter o próprio e-mail durante a edição,
        mas impedir o uso de um e-mail que já pertença a outro usuário.
        """
        user = self.context['request'].user
        # Exclui o próprio usuário da busca para não dar erro de "e-mail já existe" ao salvar o mesmo e-mail
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este endereço de e-mail já está em uso por outro usuário.")
        return value
    
    def validate(self, data):
        first_name = data.get('first_name', self.instance.first_name).strip()
        last_name = data.get('last_name', self.instance.last_name).strip()

        if first_name and last_name:
            if first_name.lower() == last_name.lower():
                raise serializers.ValidationError({
                    "last_name": "O sobrenome não pode ser igual ao nome."
                })
        
        return data