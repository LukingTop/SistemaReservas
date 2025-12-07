from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.decorators.csrf import csrf_exempt
from reservas.api_views import RecursoViewSet, ReservaViewSet, RegisterView, CustomAuthToken
from reservas.admin import admin_site 

router = DefaultRouter()
router.register(r'recursos', RecursoViewSet)
router.register(r'reservas', ReservaViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-token-auth/', csrf_exempt(CustomAuthToken.as_view()), name='api_token_auth'),
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('admin/', admin_site.urls), 
]