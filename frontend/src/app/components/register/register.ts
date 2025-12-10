import { Component, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api'; 
import Swal from 'sweetalert2'; 
import { first } from 'rxjs';

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
    first_name: '',
    last_name: '',
    admin_code: '' 
  };

  mensagemErro: string = '';

  constructor(
    private apiService: ApiService, 
    private router: Router,
    public cd: ChangeDetectorRef 
  ) {}

  verificarValidade() {
    this.cd.detectChanges();
  }

  fazerCadastro() {
    this.mensagemErro = ''; 

    this.apiService.register(this.usuario).subscribe({
      next: (res: any) => {
       
        Swal.fire({
          title: 'Cadastro Realizado!',
          text: 'Sua conta foi criada com sucesso. Faça login para continuar.',
          icon: 'success',
          confirmButtonText: 'Ir para Login',
          confirmButtonColor: '#27ae60'
        }).then(() => {
          this.router.navigate(['/login']);
        });
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