import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import adicionado
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import { CalendarOptions } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ApiService } from '../../services/api'; 

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FullCalendarModule], 
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class CalendarioComponent implements OnInit {

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek', 
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [], 
    locale: 'pt-br', 
    allDaySlot: false, 
    slotMinTime: '07:00:00',
    slotMaxTime: '23:00:00', 
    height: 'auto'
  };

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.carregarEventos();
  }

  carregarEventos() {
    this.apiService.getReservas().subscribe({
      next: (reservas: any[]) => {
        console.log('Reservas vindas do Django:', reservas); 

        const eventosFormatados = reservas.map(reserva => {
         
          console.log('Montando evento:', reserva.recurso_nome, reserva.data_hora_inicio, reserva.data_hora_fim);
          
          return {
            title: `${reserva.recurso_nome} - ${reserva.motivo}`,
            start: reserva.data_hora_inicio, 
            end: reserva.data_hora_fim,
            color: this.getCor(reserva.recurso)
          };
        });

      
        this.calendarOptions = { ...this.calendarOptions, events: eventosFormatados };
        
 
        this.cdr.detectChanges(); 
        console.log('ChangeDetectorRef disparado!');
      },
      error: (erro) => console.error('Erro ao carregar calendário:', erro)
    });
  }

  getCor(id: number): string {
    const cores = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'];
  
    if (!id) return cores[0];
    return cores[id % cores.length];
  }
}