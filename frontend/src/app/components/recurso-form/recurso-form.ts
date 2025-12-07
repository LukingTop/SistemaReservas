import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // 
import { ApiService } from '../../services/api'; 

@Component({
  selector: 'app-recurso-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recurso-form.html',
  styleUrl: './recurso-form.css'
})
export class RecursoFormComponent implements OnInit {

  recurso = {
    nome: '',
    capacidade_maxima: 10,
    localizacao: '',
    descricao: '',
    ativo: true
  };

  carregando: boolean = false;
  mensagemErro: string = '';
  
  
  isEdicao: boolean = false;
  recursoId: any = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
   
    this.recursoId = this.route.snapshot.paramMap.get('id');

    if (this.recursoId) {
      this.isEdicao = true;
      this.carregarDados(this.recursoId);
    }
  }

  carregarDados(id: number) {
    this.carregando = true;
    this.apiService.getRecurso(id).subscribe({
      next: (dados: any) => {
        this.recurso = dados; 
        this.carregando = false;
        this.cd.detectChanges();
      },
      error: (erro) => {
        console.error(erro);
        alert('Erro ao carregar dados do recurso.');
        this.router.navigate(['/']); 
      }
    });
  }

  salvarRecurso() {
    if (this.carregando) return;

    this.carregando = true;
    this.mensagemErro = '';

    
    let request$;
    if (this.isEdicao) {
      request$ = this.apiService.atualizarRecurso(this.recursoId, this.recurso);
    } else {
      request$ = this.apiService.criarRecurso(this.recurso);
    }

    request$.subscribe({
      next: (res: any) => {
        const msg = this.isEdicao ? 'Recurso atualizado com sucesso!' : 'Recurso criado com sucesso!';
        alert(msg);
        this.router.navigate(['/']); 
      },
      error: (erro: any) => {
        console.error(erro);
        this.carregando = false;
        
        if (erro.status === 403) {
          this.mensagemErro = 'Permissão negada. Apenas Admins podem gerenciar recursos.';
        } else if (erro.error) {
          const lista = Object.values(erro.error).flat();
          this.mensagemErro = lista.join('\n');
        } else {
          this.mensagemErro = 'Erro ao salvar.';
        }
        
        this.cd.detectChanges();
      }
    });
  }
}