import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, Usuario } from '../../services/auth';
import { RouterLink, RouterModule } from '@angular/router';
 

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

  constructor(private auth: Auth) {}

  ngOnInit() {
    this.auth.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
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
  cambioUser(){
    
  }
}