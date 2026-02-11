import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, Usuario } from '../../services/auth';

@Component({
  selector: 'app-nav-component',
  imports: [CommonModule],
  templateUrl: './nav-component.html',
  styleUrl: './nav-component.css',
})
export class NavComponent implements OnInit {
  activeLink = 0;
  dropdownOpen = false;
  usuario: Usuario | null = null;

  constructor(private auth: Auth) {}

  ngOnInit() {
    this.auth.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  setActiveLink(index: number): void {
    this.activeLink = index;
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
