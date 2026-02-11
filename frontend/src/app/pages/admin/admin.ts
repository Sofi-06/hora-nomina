import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Auth } from '../../services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, NavComponent],
  template: `
    <app-nav-component></app-nav-component>
    <div class="container">
      <h1>Panel de Administrador</h1>
      <p>Bienvenido, {{ nombreUsuario }}</p>
      <div class="content">
        <h2>Funciones de Administrador:</h2>
        <ul>
          <li>Gestionar usuarios</li>
          <li>Configurar sistema</li>
          <li>Ver reportes generales</li>
          <li>Administrar cursos</li>
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
export class Admin implements OnInit, OnDestroy {
  nombreUsuario: string = '';
  private subscription?: Subscription;

  constructor(private auth: Auth) {}

  ngOnInit() {
    // 👇 Suscribirse al observable para recibir actualizaciones en tiempo real
    this.subscription = this.auth.usuario$.subscribe(usuario => {
      this.nombreUsuario = usuario?.name || '';
    });
  }

  ngOnDestroy() {
    // 👇 Limpiar la suscripción para evitar memory leaks
    this.subscription?.unsubscribe();
  }
}