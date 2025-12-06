import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api'; 
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recursos-list',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './recursos-list.html', 
  styleUrl: './recursos-list.css'
})
export class RecursosListComponent implements OnInit {
  
  recursos: any[] = [];

  constructor(
      private apiService: ApiService,
      private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarRecursos();
  }

  carregarRecursos() {
    this.apiService.getRecursos().subscribe({
      next: (dados: any) => {
        console.log('Dados recebidos:', dados);
        this.recursos = dados;

         this.cd.detectChanges();
      },
      error: (erro: any) => {
        console.error('Erro:', erro);
      }
    });
  }
}