from rest_framework import viewsets, permissions, authentication, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.core.mail import send_mail
from .models import Recurso, Reserva, CodigoConvite
from .serializers import RecursoSerializer, ReservaSerializer, UserSerializer


class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    authentication_classes = [authentication.TokenAuthentication]
 
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        
        
        eh_manutencao = self.request.data.get('eh_manutencao', False)
        
        novo_status = 'P' 

        if user.is_staff:
            if eh_manutencao:
                novo_status = 'M' 
            else:
                novo_status = 'C' 
        
        
        reserva = serializer.save(usuario=user, status=novo_status)
        
        
        if novo_status != 'M' and user.email:
            assunto = 'Confirmação de Reserva'
            mensagem = f"""
            Olá, {user.username}!
            
            Sua reserva foi recebida com sucesso.
            
            Recurso: {reserva.recurso.nome}
            Motivo: {reserva.motivo}
            Início: {reserva.data_hora_inicio}
            Fim: {reserva.data_hora_fim}
            
            Status Atual: {reserva.get_status_display()}
            """
            
            send_mail(
                subject=assunto,
                message=mensagem,
                from_email=None, 
                recipient_list=[user.email],
                fail_silently=False,
            )

    @action(detail=False, methods=['get'])
    def meus_agendamentos(self, request):
        minhas_reservas = Reserva.objects.filter(usuario=request.user)
        serializer = self.get_serializer(minhas_reservas, many=True)
        return Response(serializer.data)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny] 
    serializer_class = UserSerializer


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username, 
            'email': user.email,
            'is_staff': user.is_staff
        })