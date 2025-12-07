import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api'; 

@Component({
  selector: 'app-busca-avancada',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './busca-avancada.html',
  styleUrl: './busca-avancada.css'
})
export class BuscaAvancadaComponent {

  filtro = {
    inicio: '',
    fim: '',
    capacidade: 1
  };

  resultados: any[] = [];
  buscou: boolean = false;
  carregando: boolean = false;

  constructor(
    private apiService: ApiService, 
    private cd: ChangeDetectorRef
  ) {}

  pesquisar() {
    if (!this.filtro.inicio || !this.filtro.fim) {
      alert('Por favor, preencha os horários de início e fim.');
      return;
    }

    this.carregando = true;
    this.buscou = true;
    this.resultados = []; 

    this.apiService.buscarRecursosDisponiveis(
      this.filtro.inicio, 
      this.filtro.fim, 
      this.filtro.capacidade
    ).subscribe({
      next: (dados: any) => {
        console.log('Resultados da busca:', dados);
        this.resultados = dados;
        this.carregando = false;
        this.cd.detectChanges();
      },
      error: (erro) => {
        console.error('Erro na busca:', erro);
        alert('Erro ao buscar salas disponíveis.');
        this.carregando = false;
        this.cd.detectChanges();
      }
    });
  }
}