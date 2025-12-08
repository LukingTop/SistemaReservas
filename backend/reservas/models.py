from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid
# Imports necessários para o sistema de recuperação de senha via sinal
from django.dispatch import receiver
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail

class Recurso(models.Model):
    """
    Representa o ativo físico que será reservado (Ex: Sala, Laboratório, Projetor).
    """
    nome = models.CharField(max_length=100, unique=True)
    capacidade_maxima = models.PositiveIntegerField(default=1)
    localizacao = models.CharField(max_length=200, blank=True)
    descricao = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)
    
    # Campo para armazenar a imagem da sala.
    # Requer configuração de MEDIA_ROOT no settings.py e biblioteca Pillow.
    foto = models.ImageField(upload_to='recursos/', null=True, blank=True)

    def __str__(self):
        return self.nome


class Reserva(models.Model):
    """
    Entidade central do sistema.
    Gerencia o agendamento, vinculando um Usuário a um Recurso em um intervalo de tempo.
    """
    recurso = models.ForeignKey(Recurso, on_delete=models.CASCADE, related_name='reservas')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)

    data_hora_inicio = models.DateTimeField()
    data_hora_fim = models.DateTimeField()
    
    motivo = models.CharField(max_length=255)
    
    # Status possíveis para o fluxo de aprovação
    STATUS_CHOICES = [
        ('P', 'Pendente'),      # Aguardando aprovação (padrão para alunos)
        ('C', 'Confirmada'),    # Aprovada (padrão para admins/professores)
        ('R', 'Rejeitada'),     # Negada pelo admin
        ('X', 'Cancelada'),     # Cancelada pelo próprio usuário
        ('M', 'Em Manutenção'), # Bloqueio administrativo
    ]
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')

    class Meta:
        ordering = ['data_hora_inicio']
        verbose_name_plural = "Reservas"

    def clean(self):
        """
        Lógica de Validação Customizada (Regras de Negócio).
        Este método é chamado automaticamente antes de salvar (.save()) via ModelForm ou Serializer.
        """
        
        # 1. Regra de Coerência Temporal: O fim não pode ser antes do início.
        if self.data_hora_inicio >= self.data_hora_fim:
            raise ValidationError("A data/hora de início deve ser anterior à data/hora de fim.")
        
        # 2. Regra de Retroatividade: Não permite agendar no passado.
        # Nota: 'if not self.pk' garante que a regra só vale para CRIAÇÃO, permitindo editar reservas antigas.
        if self.data_hora_inicio < timezone.now():
            if not self.pk: 
                raise ValidationError("Não é possível criar uma reserva para um horário no passado.")

        # 3. Regra de Conflito de Horário (Overlap)
        # Verifica se já existe alguma reserva ATIVA ('C', 'P' ou 'M') para o mesmo recurso.
        # Reservas canceladas ('X') ou rejeitadas ('R') não bloqueiam a agenda.
        conflitos = Reserva.objects.filter(
            recurso=self.recurso,
            status__in=['C', 'P', 'M']
        )
        
        # Se for uma edição, exclui a própria reserva da busca para não conflitar consigo mesma.
        if self.pk:
            conflitos = conflitos.exclude(pk=self.pk)

        # A lógica matemática do conflito:
        # Existe interseção se: (InicioNovo < FimExistente) E (FimNovo > InicioExistente)
        conflitos = conflitos.filter(
            data_hora_inicio__lt=self.data_hora_fim, 
            data_hora_fim__gt=self.data_hora_inicio  
        )
        
        # Se encontrou conflito, levanta erro e impede o salvamento.
        if conflitos.exists():
            conflito = conflitos.first()
            if conflito.status == 'M':
                msg = f"Este recurso está bloqueado para manutenção das {conflito.data_hora_inicio.strftime('%H:%M')} às {conflito.data_hora_fim.strftime('%H:%M')}."
            else:
                msg = f"Conflito! Reservado por {conflito.usuario.username} das {conflito.data_hora_inicio.strftime('%H:%M')} às {conflito.data_hora_fim.strftime('%H:%M')}."
            
            raise ValidationError(msg)

    def save(self, *args, **kwargs):
        # Garante que as validações do clean() sejam executadas mesmo ao salvar via código/shell
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reserva de {self.recurso.nome} ({self.status})"

class CodigoConvite(models.Model):
    """
    Gerencia os tokens de uso único para cadastro de novos administradores/professores.
    Evita que qualquer pessoa se cadastre como admin sem permissão.
    """
    codigo = models.CharField(max_length=50, unique=True, editable=False)
    usado = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(auto_now_add=True)
    
    # Rastreabilidade: Quem usou este código?
    usado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Gera o código automaticamente se não for informado (ex: via comando manage.py)
        if not self.codigo:
            self.codigo = "PROF-" + uuid.uuid4().hex[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        estado = "USADO" if self.usado else "VÁLIDO"
        return f"{self.codigo} ({estado})"
    
# --- Sinais (Signals) ---

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    Escuta o evento de criação de token de recuperação de senha.
    Envia o e-mail contendo o link para o Frontend (Angular) onde o usuário define a nova senha.
    """
    
    # Constrói o link para a rota do Angular
    link = f"http://localhost:4200/nova-senha?token={reset_password_token.key}"

    email_mensagem = f"""
    Olá, {reset_password_token.user.username}!
    
    Recebemos um pedido para redefinir a senha da sua conta.
    
    Clique no link abaixo para criar uma nova senha:
    {link}
    
    Se você não pediu isso, ignore este e-mail.
    """

    send_mail(
        subject="Redefinição de Senha - Sistema de Reservas",
        message=email_mensagem,
        from_email=None, 
        recipient_list=[reset_password_token.user.email]
    )