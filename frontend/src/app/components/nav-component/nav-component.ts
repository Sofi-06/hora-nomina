import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, Usuario } from '../../services/auth';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-component',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './nav-component.html',
  styleUrl: './nav-component.css',
})
export class NavComponent implements OnInit {
  activeLink = 0;
  dropdownOpen = false;
  usuario: Usuario | null = null;
  inicioRoute = '/home';
  role = '';

  constructor(
    private readonly auth: Auth,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.auth.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
      this.role = (usuario?.role || '').toLowerCase();
      this.inicioRoute = this.getInicioRoute(usuario?.role);
    });

    const usuarioActual = this.auth.getUsuarioActual();
    this.role = (usuarioActual?.role || '').toLowerCase();
    this.inicioRoute = this.getInicioRoute(usuarioActual?.role);
  }

  isDocente(): boolean {
    return this.role === 'docente';
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  private getInicioRoute(role?: string): string {
    switch ((role || '').toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'docente':
        return '/docente';
      case 'director':
        return '/director';
      default:
        return '/home';
    }
  }

  isUsersActive(): boolean {
    return this.router.url.startsWith('/usuarios') || this.router.url.startsWith('/crearUsuarios') || this.router.url.startsWith('/editarUsuarios');
  }

  isCodesActive(): boolean {
    return this.router.url.startsWith('/codigos') || this.router.url.startsWith('/crearCodigos') || this.router.url.startsWith('/editarCodigos') || this.router.url.startsWith('/verActividades');
  }

  isActivitiesActive(): boolean {
  return this.router.url.startsWith('/actividades') || this.router.url.startsWith('/estadoActividades') || this.router.url.startsWith('/reportes') || this.router.url.startsWith('/verReportes');
}

  isDocenteActive(): boolean {
    return this.router.url.startsWith('/docente') || this.router.url.startsWith('/crearActividad') || this.router.url.startsWith('/editarActividad');
  }

  isInicioActive(): boolean {
    if (this.role === 'docente') {
      return this.isDocenteActive();
    }
    return this.router.url === this.inicioRoute;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  logout(): void {
    this.auth.logout();
  }
}
