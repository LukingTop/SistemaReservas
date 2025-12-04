from rest_framework import viewsets, permissions, authentication, generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Recurso, Reserva
from .serializers import RecursoSerializer, ReservaSerializer, UserSerializer
from django.core.mail import send_mail


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
        novo_status = 'C' if user.is_staff else 'P'
        
        
        reserva = serializer.save(usuario=user, status=novo_status)
        
        
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
        
        if user.email:
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