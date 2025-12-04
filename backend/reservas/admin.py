from django.contrib import admin
from django.utils.html import format_html 
from .models import Recurso, Reserva

@admin.register(Recurso)
class RecursoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'capacidade_maxima', 'localizacao', 'ativo')
    list_filter = ('ativo', 'capacidade_maxima')
    search_fields = ('nome', 'localizacao', 'descricao')

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):

    list_display = ('recurso', 'usuario', 'data_hora_inicio', 'data_hora_fim', 'status', 'status_colorido')
    
    list_filter = ('status', 'recurso', 'data_hora_inicio')
    search_fields = ('usuario__username', 'recurso__nome', 'motivo')
    date_hierarchy = 'data_hora_inicio'
    ordering = ('-data_hora_inicio',)
    
    list_editable = ('status',)

    @admin.display(description='Visualização')
    def status_colorido(self, obj):
        cores = {
            'C': 'green',   
            'P': 'orange',  
            'R': 'red',     
            'X': 'gray',    
        }
        cor = cores.get(obj.status, 'black')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            cor,
            obj.get_status_display()
        )