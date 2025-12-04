import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api'; 

@Component({
  selector: 'app-recurso-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recurso-form.html',
  styleUrl: './recurso-form.css'
})
export class RecursoFormComponent {

  recurso = {
    nome: '',
    capacidade_maxima: 10,
    localizacao: '',
    descricao: '',
    ativo: true
  };

  carregando: boolean = false;
  mensagemErro: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  salvarRecurso() {
    if (this.carregando) return;

    this.carregando = true;
    this.mensagemErro = '';

    this.apiService.criarRecurso(this.recurso).subscribe({
      next: (res: any) => {
        alert(`Recurso "${res.nome}" criado com sucesso!`);
        this.carregando = false;
        this.router.navigate(['/']); 
      },
      error: (erro: any) => {
        console.error(erro);
        this.carregando = false;
        
        if (erro.status === 403) {
          this.mensagemErro = 'Você não tem permissão para criar recursos (Apenas Admins/Staff).';
        } else if (erro.error) {
      
          const lista = Object.values(erro.error).flat();
          this.mensagemErro = lista.join('\n');
        } else {
          this.mensagemErro = 'Erro desconhecido ao salvar recurso.';
        }
        
      
        this.cd.detectChanges();
      }
    });
  }
}