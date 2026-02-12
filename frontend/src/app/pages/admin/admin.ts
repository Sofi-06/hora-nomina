import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Footer } from '../../components/footer/footer';
import { ListUsers } from './usuarios/list-users/list-users';
import { Auth } from '../../services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, NavComponent, Footer, ListUsers],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit, OnDestroy {
  nombreUsuario: string = '';
  currentDate: string = '';
  activeSection: number = 0; // 0: Dashboard, 4: Usuarios
  
  // Métricas del dashboard
  totalUsuarios: number = 0;
  porcentajeUsuarios: number = 0;
  totalActividades: number = 0;
  porcentajeActividades: number = 0;
  entregasPendientes: number = 0;
  vencenHoy: number = 0;
  entregasAprobadas: number = 0;
  porcentajeAprobacion: number = 0;
  
  private subscription?: Subscription;

  constructor(private auth: Auth) {}

  ngOnInit() {
    const usuario = this.auth.getUsuarioActual();
    this.nombreUsuario = usuario?.name || 'Administrador';
    this.setCurrentDate();
    this.loadDashboardData();
    
    // Escuchar cambios en la sección activa del nav
    if (this.auth.activeNavSection$) {
      this.subscription = this.auth.activeNavSection$.subscribe(section => {
        this.activeSection = section;
      });
    }
  }

  private setCurrentDate(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    this.currentDate = now.toLocaleDateString('es-ES', options)
      .split(',')
      .map(part => part.trim())
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(', ');
  }

  private loadDashboardData(): void {
    this.auth.getDashboardMetrics()
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            console.log('✅ Métricas cargadas:', response.data);
            this.totalUsuarios = response.data.totalUsuarios;
            this.porcentajeUsuarios = response.data.porcentajeUsuarios;
            this.totalActividades = response.data.totalActividades;
            this.porcentajeActividades = response.data.porcentajeActividades;
            this.entregasPendientes = response.data.entregasPendientes;
            this.vencenHoy = response.data.vencenHoy;
            this.entregasAprobadas = response.data.entregasAprobadas;
            this.porcentajeAprobacion = response.data.porcentajeAprobacion;
          }
        },
        error: (error) => {
          console.error('❌ Error cargando métricas:', error);
        }
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}