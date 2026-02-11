import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-director',
  imports: [CommonModule, NavComponent],
  template: `
    <app-nav-component></app-nav-component>
    <div class="container">
      <h1>Panel de Director</h1>
      <p>Bienvenido, {{ nombreUsuario }}</p>
      <div class="content">
        <h2>Funciones de Director:</h2>
        <ul>
          <li>Gestión académica</li>
          <li>Supervisión de docentes</li>
          <li>Reportes institucionales</li>
          <li>Administración de programas</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .content {
      margin-top: 30px;
    }
    ul {
      list-style-type: disc;
      padding-left: 20px;
    }
    li {
      margin-bottom: 10px;
    }
  `]
})
export class Director implements OnInit {
  nombreUsuario: string = '';

  constructor(private auth: Auth) {}

  ngOnInit() {
    const usuario = this.auth.getUsuarioActual();
    this.nombreUsuario = usuario?.name || '';
  }
}