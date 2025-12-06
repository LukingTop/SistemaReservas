from django.core.management.base import BaseCommand
from reservas.models import CodigoConvite

class Command(BaseCommand):
    help = 'Gera um novo código de convite único para administradores'

    def handle(self, *args, **kwargs):
        novo_convite = CodigoConvite.objects.create()
        
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS(f' 🔑 NOVO CÓDIGO GERADO: {novo_convite.codigo}'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write('Copie este código e envie para o novo professor.')
        self.stdout.write('Atenção: Este código expira automaticamente após o primeiro uso.')