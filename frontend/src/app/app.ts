import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router'; 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'reserva-frontend';

  constructor(private router: Router) {}

  sair() {
  
    localStorage.removeItem('token');
   
    this.router.navigate(['/login']);
  }
}