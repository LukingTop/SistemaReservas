import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api'; 
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recursos-list',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './recursos-list.html', 
  styleUrl: './recursos-list.css'
})
export class RecursosListComponent implements OnInit {
  
  recursos: any[] = [];
  ehAdmin: boolean = false; // 🌟 Controle de permissão

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
        this.recursos = dados;
        this.cd.detectChanges();
      },
      error: (erro: any) => console.error('Erro:', erro)
    });
  }

  
  excluir(id: number, nome: string) {
    if (confirm(`Tem certeza que deseja excluir o recurso "${nome}"? Isso apagará todas as reservas associadas a ele.`)) {
      this.apiService.excluirRecurso(id).subscribe({
        next: () => {
          alert('Recurso excluído com sucesso!');
          this.carregarRecursos(); 
        },
        error: (erro) => {
          console.error(erro);
          alert('Erro ao excluir. Verifique se você tem permissão.');
        }
      });
    }
  }
}