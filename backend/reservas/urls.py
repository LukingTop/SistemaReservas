from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.decorators.csrf import csrf_exempt
from reservas.api_views import (   RecursoViewSet, ReservaViewSet, RegisterView, CustomAuthToken,UserProfileView )
from reservas.admin import admin_site 

# Configuração do Roteador (DRF) 
router = DefaultRouter()
router.register(r'recursos', RecursoViewSet)
router.register(r'reservas', ReservaViewSet)

urlpatterns = [
    # Inclui todas as rotas geradas automaticamente pelo router acima
    path('api/', include(router.urls)),
    
    # Autenticação 
    
    # Rota de Login (Obter Token)
    path('api-token-auth/', csrf_exempt(CustomAuthToken.as_view()), name='api_token_auth'),
    
    # Rota de Cadastro
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    
    # Perfil do Usuário 
    path('api/perfil/', UserProfileView.as_view(), name='user_profile'),
    
    # Painel Admin Personalizado
    path('admin/', admin_site.urls), 
    
    # Recuperação de Senha
    path('reservas/api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]