import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nova-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nova-senha.html',
  styleUrl: './nova-senha.css'
})
export class NovaSenhaComponent implements OnInit {
  token: string = '';
  senha: string = '';
  carregando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
   
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  salvarSenha() {
    if (!this.token) {
        Swal.fire('Erro', 'Link inválido (sem token). Solicite um novo e-mail.', 'error');
        return;
    }

    this.carregando = true;
    this.api.confirmarNovaSenha({ token: this.token, password: this.senha }).subscribe({
      next: () => {
        this.carregando = false;
        Swal.fire({
          title: 'Senha alterada!',
          text: 'Você já pode fazer login com a nova senha.',
          icon: 'success',
          confirmButtonColor: '#27ae60'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: () => {
        this.carregando = false;
        Swal.fire('Erro', 'Link expirado ou inválido. Tente solicitar novamente.', 'error');
      }
    });
  }
}