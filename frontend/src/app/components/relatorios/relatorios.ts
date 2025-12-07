import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css'
})
export class RelatoriosComponent {

  constructor(private apiService: ApiService) {}

  downloadArquivo(tipo: 'pdf' | 'excel') {
    const request$ = tipo === 'pdf' 
      ? this.apiService.baixarPDF() 
      : this.apiService.baixarExcel();

    request$.subscribe({
      next: (blob: Blob) => {
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_reservas.${tipo === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (erro) => alert('Erro ao baixar relatório.')
    });
  }
}