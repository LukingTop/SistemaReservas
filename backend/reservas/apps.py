from django.apps import AppConfig


class ReservasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reservas'

    def ready(self):
        # Importa o admin para garantir que o código seja lido
        import reservas.admin
