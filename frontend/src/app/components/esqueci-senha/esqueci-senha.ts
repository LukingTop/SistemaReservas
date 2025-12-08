import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.css'
})
export class EsqueciSenhaComponent {
  email: string = '';
  carregando: boolean = false;

  constructor(private api: ApiService, private router: Router) {}

  enviar() {
    this.carregando = true;
    this.api.esqueciSenha(this.email).subscribe({
      next: () => {
        this.carregando = false;
        Swal.fire({
          title: 'E-mail enviado!',
          text: 'Verifique sua caixa de entrada (e spam) para redefinir a senha.',
          icon: 'success',
          confirmButtonColor: '#27ae60'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: () => {
        this.carregando = false;
        Swal.fire('Erro', 'E-mail não encontrado ou erro no servidor.', 'error');
      }
    });
  }
}