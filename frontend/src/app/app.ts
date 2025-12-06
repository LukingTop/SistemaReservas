import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiService } from './services/api'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = 'reserva-frontend';
  username: string | null = null; 

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    
    this.apiService.usuario$.subscribe(nome => {
      this.username = nome;
    });
  }

  sair() {
    this.apiService.logout(); 
    this.router.navigate(['/login']);
  }
}