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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class RecursoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar os recursos (salas, laboratórios, equipamentos).
    Permite listagem pública (leitura), mas modificação apenas por autenticados.
    """
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def buscar_disponiveis(self, request):
        """
        Algoritmo de verificação de disponibilidade.
        Recebe 'inicio', 'fim' e 'capacidade'.
        Retorna apenas recursos que NÃO possuem conflito de horário no intervalo solicitado.
        """
        inicio = request.query_params.get('inicio')
        fim = request.query_params.get('fim')
        capacidade = request.query_params.get('capacidade', 0)

        if not inicio or not fim:
            return Response({"erro": "Datas de início e fim são obrigatórias."}, status=400)

        # Filtra recursos que atendem à capacidade mínima solicitada
        recursos = Recurso.objects.filter(ativo=True, capacidade_maxima__gte=capacidade)

        # Lógica de Conflito:
        # Busca reservas que estejam confirmadas (C), pendentes (P) ou em manutenção (M)
        # O conflito ocorre se a reserva existente começar ANTES do fim solicitado
        # E terminar DEPOIS do início solicitado.
        reservas_conflitantes = Reserva.objects.filter(
            status__in=['C', 'P', 'M'],
            data_hora_inicio__lt=fim,
            data_hora_fim__gt=inicio
        ).values_list('recurso_id', flat=True)

        # Exclui da lista de recursos aqueles que possuem IDs na lista de conflitos
        disponiveis = recursos.exclude(id__in=reservas_conflitantes)
        serializer = self.get_serializer(disponiveis, many=True)
        return Response(serializer.data)


class ReservaViewSet(viewsets.ModelViewSet):
    """
    API endpoint central para criação e gerenciamento de reservas.
    Contém a lógica de automação de aprovação, envio de e-mails e WebSockets.
    """
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Sobrescreve o salvamento padrão para injetar lógica de negócios automáticas:
        1. Define status automático (Aprovado para Admins, Pendente para Comuns).
        2. Envia e-mail de confirmação.
        3. Envia notificação em tempo real via WebSocket (Django Channels).
        """
        user = self.request.user
        eh_manutencao = self.request.data.get('eh_manutencao', False)
        novo_status = 'P' # Padrão: Pendente

        # Automação 1: Staff tem aprovação imediata
        if user.is_staff:
            if eh_manutencao:
                novo_status = 'M' # Manutenção
            else:
                novo_status = 'C' # Confirmado
        
        # Salva a instância com os dados processados
        reserva = serializer.save(usuario=user, status=novo_status)
        
        # Automação 2: Envio de E-mail (Assíncrono na prática seria ideal, mas aqui é síncrono para simplicidade acadêmica)
        if novo_status != 'M' and user.email:
            assunto = 'Confirmação de Reserva'
            mensagem = f"""
            Olá, {user.username}!
            Sua reserva foi recebida.
            Recurso: {reserva.recurso.nome}
            Início: {reserva.data_hora_inicio}
            Status: {reserva.get_status_display()}
            """
            try:
                # fail_silently=True evita que o sistema quebre se o servidor SMTP falhar
                send_mail(subject=assunto, message=mensagem, from_email=None, recipient_list=[user.email], fail_silently=True)
            except Exception as e:
                print(f"Erro ao enviar e-mail: {e}")

        # Automação 3: Notificação Real-time via WebSocket
        try:
            channel_layer = get_channel_layer()
            mensagem_ws = f"Nova reserva: {reserva.recurso.nome} por {user.username} ({reserva.get_status_display()})"
            
            # Como views são código síncrono e Channels é assíncrono, usamos async_to_sync
            # Envia para o grupo 'admin_reservas' que o front-end administrativo escuta
            async_to_sync(channel_layer.group_send)(
                "admin_reservas",
                {
                    "type": "enviar_notificacao", # Método que será chamado no Consumer
                    "message": mensagem_ws
                }
            )
        except Exception as e:
            print(f"Erro ao enviar WebSocket: {e}")

    @action(detail=False, methods=['get'])
    def meus_agendamentos(self, request):
        """Retorna apenas as reservas do usuário logado."""
        minhas_reservas = Reserva.objects.filter(usuario=request.user)
        serializer = self.get_serializer(minhas_reservas, many=True)
        return Response(serializer.data)

    
    @action(detail=False, methods=['get'])
    def relatorio_pdf(self, request):
        """
        Gera relatório em PDF usando a biblioteca ReportLab.
        Útil para arquivamento físico ou burocracia acadêmica.
        """
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="reservas_relatorio.pdf"'

        p = canvas.Canvas(response, pagesize=A4)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(100, 800, "Relatório Geral de Reservas")
        
        p.setFont("Helvetica-Bold", 10)
        y = 750
        # Cabeçalho da tabela
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
            # Lógica de paginação simples
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
        """
        Exporta dados para Excel (XLSX) usando OpenPyXL.
        Permite manipulação posterior dos dados pelos gestores.
        """
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
            # Remove timezone para compatibilidade com Excel
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
    """Endpoint público para cadastro de novos usuários."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer


class CustomAuthToken(ObtainAuthToken):
    """
    Retorna o Token de Autenticação + Dados extras do usuário.
    Evita que o frontend precise fazer uma segunda requisição para saber quem logou.
    """
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