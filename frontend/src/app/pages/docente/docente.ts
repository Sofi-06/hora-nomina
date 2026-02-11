import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-docente',
  imports: [CommonModule, NavComponent],
  template: `
    <app-nav-component></app-nav-component>
    <div class="container">
      <h1>Panel de Docente</h1>
      <p>Bienvenido, {{ nombreUsuario }}</p>
      <div class="content">
        <h2>Funciones de Docente:</h2>
        <ul>
          <li>Gestionar materias</li>
          <li>Subir contenido</li>
          <li>Calificar estudiantes</li>
          <li>Ver reportes de clase</li>
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
export class Docente implements OnInit {
  nombreUsuario: string = '';

  constructor(private auth: Auth) {}

  ngOnInit() {
    const usuario = this.auth.getUsuarioActual();
    this.nombreUsuario = usuario?.name || '';
  }
}