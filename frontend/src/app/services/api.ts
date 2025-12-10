import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 * @class ApiService
 * @description
 * Serviço central responsável por toda a comunicação HTTP com o Backend Django.
 * Implementa o padrão Singleton (via 'providedIn: root'), garantindo uma única
 * instância do serviço para toda a aplicação.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // URL base da API 
  private apiUrl = 'http://127.0.0.1:8000'; 

  // GERENCIAMENTO DE ESTADO REATIVO (RxJS)
  
  
  // BehaviorSubject: Um tipo de Observable que guarda o valor atual.
  // Útil para que componentes saibam se o usuário está logado assim que carregam,
  // sem precisar fazer uma requisição nova.
  private usuarioSubject = new BehaviorSubject<string | null>(localStorage.getItem('username'));
  
  // Expomos apenas o Observable (com $) para que componentes possam apenas "ouvir" 
  // e não modificar o estado diretamente (Encapsulamento).
  public usuario$ = this.usuarioSubject.asObservable();

  private isAdminSubject = new BehaviorSubject<boolean>(localStorage.getItem('is_staff') === 'true');
  public isAdmin$ = this.isAdminSubject.asObservable();

  constructor(private http: HttpClient) { }

  // AUTENTICAÇÃO E SESSÃO

  /**
   * Realiza o login e obtém o Token DRF.
   * @param credenciais Objeto contendo username e password
   */
  login(credenciais: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api-token-auth/`, credenciais);
  }

  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/perfil/`, { headers: this.getAuthHeaders() });
  }

  atualizarPerfil(dados: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reservas/api/perfil/`, dados, { headers: this.getAuthHeaders() });
  }

  /**
   * Persiste a sessão no LocalStorage e notifica todos os componentes inscritos (subscribers)
   * que o estado do usuário mudou.
   */
  salvarSessao(token: string, username: string, is_staff: boolean) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('is_staff', String(is_staff));
    
    // Emite o novo valor para todos os ouvintes do sistema
    this.usuarioSubject.next(username);
    this.isAdminSubject.next(is_staff);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_staff');
    
    // Limpa o estado reativo
    this.usuarioSubject.next(null);
    this.isAdminSubject.next(false);
  }

  register(dadosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api/register/`, dadosUsuario);
  }

  /**
   * Método auxiliar para injetar o Token em requisições protegidas.
   * Adiciona o cabeçalho 'Authorization: Token <chave>'.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  }

  // RECURSOS (CRUD)

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

  /**
   * Busca personalizada enviando query params para o filtro no backend.
   */
  buscarRecursosDisponiveis(inicio: string, fim: string, capacidade: number): Observable<any> {
    const params = `?inicio=${inicio}&fim=${fim}&capacidade=${capacidade}`;
    return this.http.get(`${this.apiUrl}/reservas/api/recursos/buscar_disponiveis/${params}`, { headers: this.getAuthHeaders() });
  }

  // RESERVAS

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

  // RECUPERAÇÃO DE SENHA

  esqueciSenha(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api/password_reset/`, { email });
  }

  confirmarNovaSenha(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/api/password_reset/confirm/`, dados);
  }

  // RELATÓRIOS (Manipulação de Blobs)

  /**
   * Solicita o PDF. Note o 'responseType: blob'.
   * Isso avisa ao Angular que a resposta não é JSON, mas sim um arquivo binário
   * (Binary Large Object), essencial para downloads de arquivos.
   */
  baixarPDF(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/reservas/relatorio_pdf/`, { 
      headers: this.getAuthHeaders(),
      responseType: 'blob' 
    });
  }

  baixarExcel(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas/api/reservas/relatorio_excel/`, { 
      headers: this.getAuthHeaders(),
      responseType: 'blob' 
    });
  }
}