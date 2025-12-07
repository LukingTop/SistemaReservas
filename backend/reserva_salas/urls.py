import os
from django.conf import settings
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.decorators.csrf import csrf_exempt
from reservas.api_views import RecursoViewSet, ReservaViewSet, RegisterView, CustomAuthToken
from reservas.admin import admin_site, RecursoAdmin, ReservaAdmin, CodigoConviteAdmin
from reservas.models import Recurso, Reserva, CodigoConvite
from django.contrib.auth.models import User, Group


router = DefaultRouter()
router.register(r'recursos', RecursoViewSet)
router.register(r'reservas', ReservaViewSet)


try:
    admin_site.register(Recurso, RecursoAdmin)
    admin_site.register(Reserva, ReservaAdmin)
    admin_site.register(CodigoConvite, CodigoConviteAdmin)
    admin_site.register(User)
    admin_site.register(Group)
except:
    pass


urlpatterns = [
   
    
   
    path('reservas/api/', include(router.urls)),
    
    
    path('reservas/api-token-auth/', csrf_exempt(CustomAuthToken.as_view()), name='api_token_auth'),
    
    
    path('reservas/api/register/', RegisterView.as_view(), name='auth_register'),
    
    
    path('admin/', admin_site.urls), 
]