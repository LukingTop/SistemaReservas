import json
from django.contrib import admin
from django.db.models import Count
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.html import format_html
from django.contrib.auth.models import User, Group
from .models import Recurso, Reserva, CodigoConvite

class DashboardAdminSite(admin.AdminSite):
    site_header = "Gestão de Reservas Acadêmicas"
    site_title = "Admin Reservas"
    index_title = "Dashboard de Controle"

    def index(self, request, extra_context=None):
       
        
       
        total_reservas = Reserva.objects.count()
        
     
        salas_populares = (
            Reserva.objects
            .values('recurso__nome')
            .annotate(total=Count('id'))
            .order_by('-total')[:5]
        )
        
       
        status_reservas = (
            Reserva.objects
            .values('status')
            .annotate(total=Count('id'))
        )

        
        chart_salas_labels = [item['recurso__nome'] for item in salas_populares]
        chart_salas_data = [item['total'] for item in salas_populares]
        
        status_map = dict(Reserva.STATUS_CHOICES)
        chart_status_labels = [status_map.get(item['status'], item['status']) for item in status_reservas]
        chart_status_data = [item['total'] for item in status_reservas]

       
        extra_context = extra_context or {}
        extra_context['chart_salas_labels'] = json.dumps(chart_salas_labels, cls=DjangoJSONEncoder)
        extra_context['chart_salas_data'] = json.dumps(chart_salas_data, cls=DjangoJSONEncoder)
        extra_context['chart_status_labels'] = json.dumps(chart_status_labels, cls=DjangoJSONEncoder)
        extra_context['chart_status_data'] = json.dumps(chart_status_data, cls=DjangoJSONEncoder)
        extra_context['total_reservas'] = total_reservas

        return super().index(request, extra_context=extra_context)


admin_site = DashboardAdminSite(name='dashboard_admin')



class RecursoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'capacidade_maxima', 'localizacao', 'ativo')
    list_filter = ('ativo', 'capacidade_maxima')
    search_fields = ('nome', 'localizacao')

class ReservaAdmin(admin.ModelAdmin):
    list_display = ('recurso', 'usuario', 'data_hora_inicio', 'data_hora_fim', 'status', 'status_colorido')
    list_filter = ('status', 'recurso', 'data_hora_inicio')
    search_fields = ('usuario__username', 'recurso__nome', 'motivo')
    date_hierarchy = 'data_hora_inicio'
    list_editable = ('status',)
    ordering = ('-data_hora_inicio',)

    @admin.display(description='Status')
    def status_colorido(self, obj):
        cores = {'C': 'green', 'P': 'orange', 'R': 'red', 'X': 'gray', 'M': 'black'}
        return format_html(
            '<span style="color: {}; font-weight: bold;">● {}</span>',
            cores.get(obj.status, 'black'),
            obj.get_status_display()
        )

class CodigoConviteAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'usado', 'usado_por', 'data_criacao')
    readonly_fields = ('codigo', 'data_criacao', 'usado_por')


admin_site.register(Recurso, RecursoAdmin)
admin_site.register(Reserva, ReservaAdmin)
admin_site.register(CodigoConvite, CodigoConviteAdmin)
admin_site.register(User)
admin_site.register(Group)