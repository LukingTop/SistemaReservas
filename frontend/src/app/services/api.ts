import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl = 'http://127.0.0.1:8000'; 

  constructor(private http: HttpClient) { }

  login(credenciais: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api-token-auth/`, credenciais);
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

  criarRecurso(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api/recursos/`, dados, { headers: this.getAuthHeaders() });
  }

  
  criarReserva(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api/reservas/`, dados, { headers: this.getAuthHeaders() });
  }
  
  getReservas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/reservas/`, { headers: this.getAuthHeaders() });
  }

  getMinhasReservas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/reservas/meus_agendamentos/`, { headers: this.getAuthHeaders() });
  }
  
  cancelarReserva(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservas/api/reservas/${id}/`, { headers: this.getAuthHeaders() });
  }

}