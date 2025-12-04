import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reserva-form.html',
  styleUrl: './reserva-form.css'
})
export class ReservaFormComponent implements OnInit {
  
  recursoId: any = null;
  
  carregando: boolean = false;

  reserva = {
    recurso: null,
    data_hora_inicio: '',
    data_hora_fim: '',
    motivo: ''
  };

  mensagemErro: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.recursoId = this.route.snapshot.paramMap.get('id');
    this.reserva.recurso = this.recursoId;
  }

  salvarReserva() {
    if (this.carregando) return;

    this.carregando = true; 
    this.mensagemErro = ''; 

    this.apiService.criarReserva(this.reserva).subscribe({
      next: (resposta: any) => {
        this.carregando = false; 
        console.log('Sucesso!', resposta);
        alert('Reserva criada com sucesso!');
        this.router.navigate(['/']); 
      },
      error: (erro: any) => {
        console.error('Erro:', erro);
        
        this.carregando = false; 
        
        if (erro.error) {
          const listaDeErros = Object.values(erro.error).flat();
          this.mensagemErro = listaDeErros.join('\n'); 
        } else {
          this.mensagemErro = 'Erro desconhecido ao tentar salvar.';
        }
        this.cd.detectChanges();
      }
    });
  }}