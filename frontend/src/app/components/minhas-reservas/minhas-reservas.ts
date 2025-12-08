import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

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

  constructor(
    private apiService: ApiService,
    private cd: ChangeDetectorRef  
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.carregando = true;
    
    this.apiService.getMinhasReservas().subscribe({
      next: (dados: any) => {
        this.reservas = dados;
        this.carregando = false;
        
        
        setTimeout(() => {
          this.cd.detectChanges();
        }, 0);
      },
      error: (erro: any) => {
        console.error('Erro ao buscar reservas:', erro);
        this.carregando = false;
        setTimeout(() => {
          this.cd.detectChanges();
        }, 0);
      }
    });
  }

  cancelar(id: number) {
    
    Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter isso!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, cancelar!',
      cancelButtonText: 'Manter reserva'
    }).then((result) => {
      if (result.isConfirmed) {
        
        
        this.apiService.cancelarReserva(id).subscribe({
          next: () => {
            Swal.fire(
              'Cancelado!',
              'Sua reserva foi cancelada.',
              'success'
            );
            this.carregarDados();
          },
          error: () => {
            Swal.fire('Erro', 'Não foi possível cancelar.', 'error');
          }
        });
      }
    });
  }
}