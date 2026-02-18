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

  constructor(
    private auth: Auth,
    private router: Router,
  ) {}

  ngOnInit() {
    this.auth.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
    });
  }

  isUsersActive(): boolean {
    return this.router.url.startsWith('/usuarios') || this.router.url.startsWith('/crearUsuarios') || this.router.url.startsWith('/editarUsuarios');
  }

  isCodesActive(): boolean {
  return this.router.url.startsWith('/codigos') || this.router.url.startsWith('/crearCodigos') || this.router.url.startsWith('/editarCodigos');
}

  isActivitiesActive(): boolean {
  return this.router.url.startsWith('/actividades') || this.router.url.startsWith('/estadoActividades');
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
  cambioUser() {}
}
