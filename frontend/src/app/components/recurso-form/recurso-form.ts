import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2'; 

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
    ativo: true,
    foto: null as any
  };

  arquivoSelecionado: File | null = null;

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
        Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
        this.router.navigate(['/']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.arquivoSelecionado = file;
    }
  }

  salvarRecurso() {
    if (this.carregando) return;
    this.carregando = true;
    this.mensagemErro = '';

    const formData = new FormData();
    formData.append('nome', this.recurso.nome);
    formData.append('capacidade_maxima', this.recurso.capacidade_maxima.toString());
    formData.append('localizacao', this.recurso.localizacao);
    formData.append('descricao', this.recurso.descricao);
    formData.append('ativo', this.recurso.ativo ? 'true' : 'false');
    
    if (this.arquivoSelecionado) {
      formData.append('foto', this.arquivoSelecionado);
    }

    let request$;
    if (this.isEdicao) {
      request$ = this.apiService.atualizarRecurso(this.recursoId, formData);
    } else {
      request$ = this.apiService.criarRecurso(formData);
    }

    request$.subscribe({
      next: (res: any) => {
        this.carregando = false;
        
       
        Swal.fire({
          title: this.isEdicao ? 'Atualizado!' : 'Criado!',
          text: `Recurso "${res.nome}" salvo com sucesso.`,
          icon: 'success',
          confirmButtonColor: '#27ae60'
        }).then(() => {
          this.router.navigate(['/']);
        });
      },
      error: (erro: any) => {
        console.error(erro);
        this.carregando = false;
        
       
        let msg = 'Erro ao salvar.';
        if (erro.status === 403) {
           msg = 'Permissão negada. Apenas Admins podem gerenciar recursos.';
        } else if (erro.error) {
           msg = Object.values(erro.error).flat().join('\n');
        }

        Swal.fire({
          title: 'Atenção',
          text: msg,
          icon: 'error',
          confirmButtonColor: '#d33'
        });
        
        this.cd.detectChanges();
      }
    });
  }
}