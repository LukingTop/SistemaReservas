
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { timer, retry } from 'rxjs'; 
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private socket$: WebSocketSubject<any> | undefined;
  
  private readonly WS_ENDPOINT = 'ws://127.0.0.1:8000/ws/notificacoes/';
  
  constructor() { }

  public connect(): void {
  
    if (!this.socket$ || this.socket$.closed) {
      console.log('🔌 Tentando conectar ao WebSocket...');
      
      this.socket$ = webSocket({
        url: this.WS_ENDPOINT,
        closeObserver: {
          next: () => console.log('❌ WebSocket desconectado.')
        },
        openObserver: {
          next: () => console.log('✅ WebSocket conectado!')
        }
      });
      
      this.socket$.pipe(
      
        retry({
          delay: (errors) => {
            console.log('🔄 Tentando reconectar em 5s...');
            return timer(5000);
          }
        })
      ).subscribe({
        next: (msg) => this.handleMessage(msg),
        error: (err) => console.error('Erro fatal no WebSocket:', err)
      });
    }
  }

  private handleMessage(msg: any) {
    console.log('📩 Notificação:', msg);
    
   
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      background: '#2c3e50', 
      color: '#ecf0f1',     
      iconColor: '#3498db'   
    });

    Toast.fire({
      icon: 'info',
      title: 'Nova Atividade',
      text: msg.message || 'Atualização no sistema.'
    });
  }

  public close(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    }
  }
}