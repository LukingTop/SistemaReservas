from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone

class Recurso(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    capacidade_maxima = models.PositiveIntegerField(default=1)
    localizacao = models.CharField(max_length=200, blank=True)
    descricao = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

class Reserva(models.Model):
    recurso = models.ForeignKey(Recurso, on_delete=models.CASCADE, related_name='reservas')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)

    data_hora_inicio = models.DateTimeField()
    data_hora_fim = models.DateTimeField()
    
    motivo = models.CharField(max_length=255)
    
    STATUS_CHOICES = [
        ('P', 'Pendente'),
        ('C', 'Confirmada'),
        ('R', 'Rejeitada'),
        ('X', 'Cancelada'),
    ]
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')

    class Meta:
        ordering = ['data_hora_inicio']
        verbose_name_plural = "Reservas"

    def clean(self):
        if self.data_hora_inicio >= self.data_hora_fim:
            raise ValidationError("A data/hora de início deve ser anterior à data/hora de fim.")
        
        if self.data_hora_inicio < timezone.now():
            
            if not self.pk: 
                raise ValidationError("Não é possível criar uma reserva para um horário no passado.")

        
        conflitos = Reserva.objects.filter(
            recurso=self.recurso,
            status__in=['C', 'P']
        )
        
        if self.pk:
            conflitos = conflitos.exclude(pk=self.pk)

        
        conflitos = conflitos.filter(
            data_hora_inicio__lt=self.data_hora_fim, 
            data_hora_fim__gt=self.data_hora_inicio  
        )
        
        if conflitos.exists():
            conflito = conflitos.first()
            raise ValidationError(
                f"Conflito de agendamento! O recurso já está reservado por "
                f"{conflito.usuario.username} das {conflito.data_hora_inicio.strftime('%H:%M')} "
                f"às {conflito.data_hora_fim.strftime('%H:%M')}."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reserva de {self.recurso.nome} por {self.usuario.username} ({self.data_hora_inicio.date()})"