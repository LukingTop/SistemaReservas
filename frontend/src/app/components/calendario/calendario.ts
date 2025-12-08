import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import { CalendarOptions } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ApiService } from '../../services/api'; 
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

/**
 * @component CalendarioComponent
 * @description
 * Componente responsável pela renderização visual das reservas.
 * Utiliza a biblioteca 'FullCalendar' para fornecer visualizações de mês, semana e dia.
 * Atua como um adaptador entre os dados da API (formato Django) e a View (formato FullCalendar).
 */
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FullCalendarModule], 
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class CalendarioComponent implements OnInit {

  // Configurações globais do componente de calendário
  calendarOptions: CalendarOptions = {
    // Define a visualização padrão como 'Semana com horários' (Time Grid Week)
    initialView: 'timeGridWeek', 
    
    // Plugins necessários para as diferentes funcionalidades
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],

    // Internacionalização para Português do Brasil
     locales: [ptBrLocale],
     locale: 'pt-br', 

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    
    events: [], // Inicialmente vazio, será populado via API

    // Customização da UI: Remove slot de "dia inteiro" e limita o horário visível
    allDaySlot: false, 
    slotMinTime: '07:00:00', // Abertura da instituição
    slotMaxTime: '23:00:00', // Fechamento da instituição
    height: 'auto'
  };

  constructor(
    private apiService: ApiService,
    // ChangeDetectorRef: Necessário para forçar a atualização da UI quando dados assíncronos
    // modificam propriedades profundas de objetos complexos (como calendarOptions).
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.carregarEventos();
  }

  /**
   * Busca as reservas no backend e as converte para o formato de Evento do FullCalendar.
   */
  carregarEventos() {
    this.apiService.getReservas().subscribe({
      next: (reservas: any[]) => {
        console.log('Reservas vindas do Django:', reservas); 

        // Padrão Adapter (Adaptação de Dados):
        // O Backend envia: { data_hora_inicio, recurso_nome, ... }
        // O FullCalendar espera: { start, title, end, ... }
        const eventosFormatados = reservas.map(reserva => {
          
          console.log('Montando evento:', reserva.recurso_nome, reserva.data_hora_inicio, reserva.data_hora_fim);
          
          return {
            title: `${reserva.recurso_nome} - ${reserva.motivo}`,
            start: reserva.data_hora_inicio, // ISO String é aceita nativamente
            end: reserva.data_hora_fim,
            color: this.getCor(reserva.recurso) // Atribuição dinâmica de cor
          };
        });

      
        // Imutabilidade:
        // Ao invés de fazer this.calendarOptions.events.push(...), nós recriamos o objeto.
        // Isso avisa ao Angular e ao FullCalendar que a referência mudou e um re-render é necessário.
        this.calendarOptions = { ...this.calendarOptions, events: eventosFormatados };
        
        // Dispara manualmente a detecção de mudanças para garantir que o calendário
        // seja redesenhado imediatamente após a chegada dos dados assíncronos.
        this.cdr.detectChanges(); 
        console.log('ChangeDetectorRef disparado!');
      },
      error: (erro) => console.error('Erro ao carregar calendário:', erro)
    });
  }

  /**
   * Algoritmo simples de Hashing Visual.
   * Garante que o mesmo recurso (Sala A) sempre tenha a mesma cor,
   * baseando-se no ID (resto da divisão), sem precisar salvar a cor no banco de dados.
   */
  getCor(id: number): string {
    const cores = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'];
  
    if (!id) return cores[0];
    return cores[id % cores.length];
  }
}