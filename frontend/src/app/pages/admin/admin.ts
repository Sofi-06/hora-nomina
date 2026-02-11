import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, NavComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  nombreUsuario: string = '';
  currentDate: string = '';
  
  // Métricas del dashboard - inicializadas en 0
  totalUsuarios: number = 0;
  porcentajeUsuarios: number = 0;
  totalActividades: number = 0;
  porcentajeActividades: number = 0;
  entregasPendientes: number = 0;
  vencenHoy: number = 0;
  entregasAprobadas: number = 0;
  porcentajeAprobacion: number = 0;
  
  // Estado de carga
  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(private auth: Auth) {}

  ngOnInit() {
    const usuario = this.auth.getUsuarioActual();
    this.nombreUsuario = usuario?.name || 'Administrador';
    this.setCurrentDate();
    this.loadDashboardData();
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
    this.isLoading = true;
    this.hasError = false;
    
    this.auth.getDashboardMetrics()
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            // Cargar datos reales de la base de datos
            this.totalUsuarios = response.data.totalUsuarios;
            this.porcentajeUsuarios = response.data.porcentajeUsuarios;
            this.totalActividades = response.data.totalActividades;
            this.porcentajeActividades = response.data.porcentajeActividades;
            this.entregasPendientes = response.data.entregasPendientes;
            this.vencenHoy = response.data.vencenHoy;
            this.entregasAprobadas = response.data.entregasAprobadas;
            this.porcentajeAprobacion = response.data.porcentajeAprobacion;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando métricas del dashboard:', error);
          this.hasError = true;
          // Fallback a datos de ejemplo si falla
          this.loadFallbackData();
          this.isLoading = false;
        }
      });
  }

  // Método público para el botón de reintento
  retryLoadData(): void {
    this.loadDashboardData();
  }

  private loadFallbackData(): void {
    // Datos de respaldo si no se puede conectar con el backend
    this.totalUsuarios = 1284;
    this.porcentajeUsuarios = 12;
    this.totalActividades = 356;
    this.porcentajeActividades = 8;
    this.entregasPendientes = 89;
    this.vencenHoy = 15;
    this.entregasAprobadas = 1847;
    this.porcentajeAprobacion = 95;
  }
}