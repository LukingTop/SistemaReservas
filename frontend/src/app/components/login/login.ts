import { Component, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api'; 

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
        
        localStorage.setItem('token', resposta.token);
        
        this.router.navigate(['/']);
        
        this.cd.detectChanges();
      },
      error: (erro: any) => {
        console.error('Erro login:', erro);
        
       
        if (erro.status === 400) {
             this.mensagemErro = 'Usuário ou senha incorretos.';
        } else {
             this.mensagemErro = 'Erro ao conectar com o servidor.';
        }
        
        this.cd.detectChanges();
      }
    });
  }
}