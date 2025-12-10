import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css'
})
export class PerfilUsuarioComponent implements OnInit {

  usuario = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    is_staff: false
  };

  carregando: boolean = true;

  constructor(
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPerfil();
  }

  carregarPerfil() {
    this.carregando = true;
    this.apiService.getPerfil().subscribe({
      next: (dados: any) => {
        this.usuario = dados;
        this.carregando = false;
        this.cd.detectChanges();
      },
      error: (erro: any) => {
        console.error('Erro ao carregar perfil:', erro);
        this.carregando = false;
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os dados do perfil.'
        });
        this.cd.detectChanges();
      }
    });
  }

  salvarAlteracoes() {
    this.carregando = true;
    
    
    const payload = {
        email: this.usuario.email,
        first_name: this.usuario.first_name,
        last_name: this.usuario.last_name
    };

    this.apiService.atualizarPerfil(payload).subscribe({
      next: (res: any) => {
        this.carregando = false;
        
       
        Swal.fire({
          icon: 'success',
          title: 'Perfil Atualizado!',
          text: 'Suas informações foram salvas com sucesso.',
          confirmButtonColor: '#27ae60'
        });
        
        this.cd.detectChanges();
      },
      error: (erro: any) => {
        this.carregando = false;
        let msg = 'Não foi possível atualizar o perfil.';
        
        if (erro.error) {
          
            const lista = Object.values(erro.error).flat();
            msg = lista.join('\n');
        }

        Swal.fire({
          icon: 'error',
          title: 'Erro na atualização',
          text: msg
        });
        
        this.cd.detectChanges();
      }
    });
  }
}