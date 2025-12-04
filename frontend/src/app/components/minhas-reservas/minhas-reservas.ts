import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-minhas-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minhas-reservas.html',
  styleUrl: './minhas-reservas.css'
})
export class MinhasReservasComponent implements OnInit {

  reservas: any[] = [];
  carregando: boolean = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.carregando = true;
    this.apiService.getMinhasReservas().subscribe({
      next: (dados: any) => {
        this.reservas = dados;
        this.carregando = false;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar reservas:', erro);
        this.carregando = false;
      }
    });
  }

  cancelar(id: number) {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      this.apiService.cancelarReserva(id).subscribe({
        next: () => {
          alert('Reserva cancelada!');
         
          this.carregarDados();
        },
        error: (erro: any) => alert('Erro ao cancelar.')
      });
    }
  }
}