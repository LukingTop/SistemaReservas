import { Component, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html', 
  styleUrl: './register.css'      
})
export class RegisterComponent { 

  usuario = {
    username: '',
    email: '',
    password: '',
    admin_code: '' 
  };

  mensagemErro: string = '';

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private cd: ChangeDetectorRef 
  ) {}

  fazerCadastro() {
    this.mensagemErro = ''; 

    this.apiService.register(this.usuario).subscribe({
      next: (res: any) => {
        alert('Cadastro realizado com sucesso! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (erro: any) => {
        console.error(erro);
        
        if (erro.error) {
          
          const listaDeErros = Object.values(erro.error).flat();
          this.mensagemErro = listaDeErros.join('\n');
        } else {
          this.mensagemErro = 'Erro desconhecido ao tentar cadastrar.';
        }

        this.cd.detectChanges();
      }
    });
  }
}