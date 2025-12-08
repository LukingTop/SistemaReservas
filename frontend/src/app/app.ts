import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiService } from './services/api'; 
import { NotificationService } from './services/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'reserva-frontend';
  username: string | null = null;
  isAdmin: boolean = false; 
  isDarkMode: boolean = false;

  constructor(
    private router: Router, 
    private apiService: ApiService,
    private notificationService: NotificationService 
  ) {}

  ngOnInit() {
    
    this.apiService.usuario$.subscribe(nome => {
      this.username = nome;
      
      if (nome) {
        this.notificationService.connect();
      } else {
        this.notificationService.close();
      }
    });

    
    this.apiService.isAdmin$.subscribe(status => {
      this.isAdmin = status;
    });

    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  ngOnDestroy() {
    this.notificationService.close(); 
  }

  sair() {
    this.apiService.logout(); 
    this.notificationService.close(); 
    this.router.navigate(['/login']);
  }
}