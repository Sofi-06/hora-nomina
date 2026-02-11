import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-estudiante',
  imports: [CommonModule, NavComponent],
  template: `
    <app-nav-component></app-nav-component>
    <div class="container">
      <h1>Panel de Estudiante</h1>
      <p>Bienvenido, {{ nombreUsuario }}</p>
      <div class="content">
        <h2>Funciones de Estudiante:</h2>
        <ul>
          <li>Ver materias inscritas</li>
          <li>Descargar contenido</li>
          <li>Ver calificaciones</li>
          <li>Participar en foros</li>
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
export class Estudiante implements OnInit {
  nombreUsuario: string = '';

  constructor(private auth: Auth) {}

  ngOnInit() {
    const usuario = this.auth.getUsuarioActual();
    this.nombreUsuario = usuario?.name || '';
  }
}