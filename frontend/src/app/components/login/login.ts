import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  credenciais = {
    username: '',
    password: ''
  };

  mensagemErro: string = '';

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  fazerLogin() {
    this.mensagemErro = ''; 

    this.apiService.login(this.credenciais).subscribe({
      next: (resposta: any) => {
        console.log('Login OK:', resposta);
        
        
        this.apiService.salvarSessao(
          resposta.token, 
          resposta.username, 
          resposta.is_staff
        );
        
        this.router.navigate(['/']);
        this.cd.detectChanges();
      },
      
      error: (erro: any) => {
        console.error('Erro login:', erro);
        
        if (erro.status === 400) {
            this.mensagemErro = 'Usuário ou senha inválidos.';
            
            
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',  
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
            
            Toast.fire({
              icon: 'error',
              title: 'Usuário ou senha incorretos'
            });

        } else {
            this.mensagemErro = 'Erro ao conectar com o servidor.';
        }
        this.cd.detectChanges();
      }});
  }}