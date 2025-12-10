import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api'; 
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-recursos-list',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './recursos-list.html', 
  styleUrl: './recursos-list.css'
})
export class RecursosListComponent implements OnInit {
  
  recursos: any[] = [];
  ehAdmin: boolean = false;

  constructor(
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarRecursos();
    
    this.apiService.isAdmin$.subscribe(isAdmin => {
      this.ehAdmin = isAdmin;
    });
  }

  carregarRecursos() {
    this.apiService.getRecursos().subscribe({
      next: (dados: any) => {
        console.log('Dados recebidos:', dados);
        this.recursos = dados;
        this.cd.detectChanges();
      },
      error: (erro: any) => console.error('Erro:', erro)
    });
  }

  excluir(id: number, nome: string) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Você está prestes a excluir o recurso "${nome}". Isso apagará todas as reservas associadas!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', 
      cancelButtonColor: '#3085d6', 
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        
        this.apiService.excluirRecurso(id).subscribe({
          next: () => {
            Swal.fire(
              'Excluído!',
              `O recurso "${nome}" foi removido.`,
              'success'
            );
            this.carregarRecursos(); 
          },
          error: (erro) => {
            console.error(erro);
            Swal.fire('Erro', 'Não foi possível excluir. Verifique suas permissões.', 'error');
          }
        });
      }
    });
  }
}