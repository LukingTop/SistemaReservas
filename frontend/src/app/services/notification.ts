import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { timer, retry } from 'rxjs'; 
import Swal from 'sweetalert2';

/**
 * @class NotificationService
 * @description
 * Gerencia a comunicação Bidirecional e em Tempo Real (Full-Duplex) entre o cliente e o servidor via WebSockets.
 * Utiliza a biblioteca RxJS para tratar o fluxo de dados como um Stream Reativo.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  // WebSocketSubject: Uma variante especial do Subject do RxJS que envelopa a API nativa de WebSocket do navegador.
  // Ele atua tanto como Observável (recebe dados) quanto Observador (envia dados).
  private socket$: WebSocketSubject<any> | undefined;
  
  // Endpoint do Django Channels (definido no asgi.py e routing.py do backend)
  private readonly WS_ENDPOINT = 'ws://127.0.0.1:8000/ws/notificacoes/';
  
  constructor() { }

  /**
   * Inicializa a conexão persistente.
   * Implementa o padrão Singleton para garantir que apenas um túnel de socket exista por vez.
   */
  public connect(): void {
  
    if (!this.socket$ || this.socket$.closed) {
      console.log('🔌 Tentando conectar ao WebSocket...');
      
      // Configuração dos gatilhos de ciclo de vida da conexão
      this.socket$ = webSocket({
        url: this.WS_ENDPOINT,
        closeObserver: {
          next: () => console.log('❌ WebSocket desconectado.')
        },
        openObserver: {
          next: () => console.log('✅ WebSocket conectado!')
        }
      });
      
      // ======================================================================
      // ESTRATÉGIA DE RESILIÊNCIA (AUTO-RECONNECT)
      // ======================================================================
      this.socket$.pipe(
        // O operador 'retry' intercepta erros no fluxo (ex: queda de internet ou servidor offline).
        // Ao invés de encerrar o programa, ele aguarda o tempo definido no 'timer'
        // e tenta re-inscrever (re-subscribe) no Observable, forçando uma nova conexão.
        retry({
          delay: (errors) => {
            console.log('🔄 Tentando reconectar em 5s...');
            return timer(5000); // Backoff fixo de 5 segundos
          }
        })
      ).subscribe({
        next: (msg) => this.handleMessage(msg),
        error: (err) => console.error('Erro fatal no WebSocket:', err)
      });
    }
  }

  /**
   * Processa as mensagens recebidas do Backend.
   * Transforma o payload de dados (JSON) em feedback visual para o usuário (UI).
   */
  private handleMessage(msg: any) {
    console.log('📩 Notificação:', msg);
    
    // Configuração do "Toast" (Notificação flutuante não intrusiva)
    // Usa SweetAlert2 para criar alertas esteticamente agradáveis.
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 6000, // Tempo de exibição
      timerProgressBar: true,
      background: '#2c3e50', // Cores do tema do sistema
      color: '#ecf0f1',     
      iconColor: '#3498db'   
    });

    Toast.fire({
      icon: 'info',
      title: 'Nova Atividade',
      text: msg.message || 'Atualização no sistema.'
    });
  }

  /**
   * Encerra a conexão de forma limpa.
   * Importante chamar ao fazer logout para evitar vazamento de memória.
   */
  public close(): void {
    if (this.socket$) {
      this.socket$.complete(); // Fecha o stream RxJS e a conexão TCP subjacente
      this.socket$ = undefined;
    }
  }
}