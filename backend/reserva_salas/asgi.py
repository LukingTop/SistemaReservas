import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import reservas.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reserva_salas.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            reservas.routing.websocket_urlpatterns
        )
    ),
}) 