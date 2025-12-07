from django.http import HttpResponse
from rest_framework import viewsets, permissions, authentication, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db.models import Q
from .models import Recurso, Reserva, CodigoConvite
from .serializers import RecursoSerializer, ReservaSerializer, UserSerializer


import openpyxl
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
import datetime


class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

    
    @action(detail=False, methods=['get'])
    def buscar_disponiveis(self, request):
        inicio = request.query_params.get('inicio')
        fim = request.query_params.get('fim')
        capacidade = request.query_params.get('capacidade', 0)

        if not inicio or not fim:
            return Response({"erro": "Datas de início e fim são obrigatórias."}, status=400)

        recursos = Recurso.objects.filter(ativo=True, capacidade_maxima__gte=capacidade)

        reservas_conflitantes = Reserva.objects.filter(
            status__in=['C', 'P', 'M'],
            data_hora_inicio__lt=fim,
            data_hora_fim__gt=inicio
        ).values_list('recurso_id', flat=True)

        disponiveis = recursos.exclude(id__in=reservas_conflitantes)
        serializer = self.get_serializer(disponiveis, many=True)
        return Response(serializer.data)


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
            Sua reserva foi recebida.
            Recurso: {reserva.recurso.nome}
            Início: {reserva.data_hora_inicio}
            Status: {reserva.get_status_display()}
            """
            send_mail(subject=assunto, message=mensagem, from_email=None, recipient_list=[user.email], fail_silently=False)

    @action(detail=False, methods=['get'])
    def meus_agendamentos(self, request):
        minhas_reservas = Reserva.objects.filter(usuario=request.user)
        serializer = self.get_serializer(minhas_reservas, many=True)
        return Response(serializer.data)

    
    @action(detail=False, methods=['get'])
    def relatorio_pdf(self, request):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="reservas_relatorio.pdf"'

        p = canvas.Canvas(response, pagesize=A4)
        
       
        p.setFont("Helvetica-Bold", 16)
        p.drawString(100, 800, "Relatório Geral de Reservas")
        
        
        p.setFont("Helvetica-Bold", 10)
        y = 750
        p.drawString(50, y, "ID")
        p.drawString(80, y, "Recurso")
        p.drawString(200, y, "Usuário")
        p.drawString(300, y, "Início")
        p.drawString(450, y, "Status")
        
        p.line(50, y-5, 550, y-5)
        y -= 25

        if request.user.is_staff:
            reservas = Reserva.objects.all().order_by('-data_hora_inicio')
        else:
            reservas = Reserva.objects.filter(usuario=request.user).order_by('-data_hora_inicio')

        p.setFont("Helvetica", 9)
        for reserva in reservas:
            if y < 50:
                p.showPage()
                y = 800
                p.setFont("Helvetica", 9)

            p.drawString(50, y, str(reserva.id))
            p.drawString(80, y, reserva.recurso.nome[:20])
            p.drawString(200, y, reserva.usuario.username)
            data_fmt = reserva.data_hora_inicio.strftime("%d/%m/%Y %H:%M")
            p.drawString(300, y, data_fmt)
            p.drawString(450, y, reserva.get_status_display())
            y -= 15

        p.showPage()
        p.save()
        return response

    
    @action(detail=False, methods=['get'])
    def relatorio_excel(self, request):
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="reservas_relatorio.xlsx"'

        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = 'Reservas'

        columns = ['ID', 'Recurso', 'Usuário', 'Início', 'Fim', 'Motivo', 'Status']
        worksheet.append(columns)

        if request.user.is_staff:
            reservas = Reserva.objects.all().order_by('-data_hora_inicio')
        else:
            reservas = Reserva.objects.filter(usuario=request.user).order_by('-data_hora_inicio')

        for reserva in reservas:
            inicio = reserva.data_hora_inicio.replace(tzinfo=None) if reserva.data_hora_inicio else ''
            fim = reserva.data_hora_fim.replace(tzinfo=None) if reserva.data_hora_fim else ''

            worksheet.append([
                reserva.id,
                reserva.recurso.nome,
                reserva.usuario.username,
                inicio,
                fim,
                reserva.motivo,
                reserva.get_status_display()
            ])

        workbook.save(response)
        return response


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