import { Routes } from '@angular/router';
import { RecursosListComponent } from './components/recursos-list/recursos-list';
import { ReservaFormComponent } from './components/reserva-form/reserva-form';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { CalendarioComponent } from './components/calendario/calendario';
import { MinhasReservasComponent } from './components/minhas-reservas/minhas-reservas';
import { RecursoFormComponent } from './components/recurso-form/recurso-form';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  
  { path: '', component: RecursosListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  
  { 
    path: 'reservar/:id', 
    component: ReservaFormComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'calendario', 
    component: CalendarioComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'minhas-reservas', 
    component: MinhasReservasComponent,
    canActivate: [authGuard] 
  },
  
  
  { 
    path: 'novo-recurso', 
    component: RecursoFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'editar-recurso/:id',  
    component: RecursoFormComponent, 
    canActivate: [authGuard] 
  }
];