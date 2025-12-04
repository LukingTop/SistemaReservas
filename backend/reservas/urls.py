from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservaCreateView 
from .api_views import RecursoViewSet, ReservaViewSet, RegisterView
from rest_framework.authtoken.views import obtain_auth_token


router = DefaultRouter()
router.register(r'recursos', RecursoViewSet)
router.register(r'reservas', ReservaViewSet)

urlpatterns = [
    
    path('api/', include(router.urls)), 
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('api/register/', RegisterView.as_view(), name='auth_register'),
]