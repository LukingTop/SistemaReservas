import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl = 'http://127.0.0.1:8000'; 

  
  private usuarioSubject = new BehaviorSubject<string | null>(localStorage.getItem('username'));
  public usuario$ = this.usuarioSubject.asObservable();


  private isAdminSubject = new BehaviorSubject<boolean>(localStorage.getItem('is_staff') === 'true');
  public isAdmin$ = this.isAdminSubject.asObservable();

  constructor(private http: HttpClient) { }

  
  login(credenciais: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api-token-auth/`, credenciais);
  }

  
  salvarSessao(token: string, username: string, is_staff: boolean) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('is_staff', String(is_staff)); 
    
    this.usuarioSubject.next(username);
    this.isAdminSubject.next(is_staff); 
  }

 
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_staff'); 
    
    this.usuarioSubject.next(null);
    this.isAdminSubject.next(false);
  }

  register(dadosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api/register/`, dadosUsuario);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  }





  getRecursos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/recursos/`, { headers: this.getAuthHeaders() });
  }

   getRecurso(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/recursos/${id}/`, { headers: this.getAuthHeaders() });
  }

  criarRecurso(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api/recursos/`, dados, { headers: this.getAuthHeaders() });
  }

  atualizarRecurso(id: number, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/api/recursos/${id}/`, dados, { headers: this.getAuthHeaders() });
  }

  excluirRecurso(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservas/api/recursos/${id}/`, { headers: this.getAuthHeaders() });
  }

  getReservas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/reservas/`, { headers: this.getAuthHeaders() });
  }

  criarReserva(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api/reservas/`, dados, { headers: this.getAuthHeaders() });
  }

  getMinhasReservas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/reservas/meus_agendamentos/`, { headers: this.getAuthHeaders() });
  }

  cancelarReserva(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservas/api/reservas/${id}/`, { headers: this.getAuthHeaders() });
  }

  
}

