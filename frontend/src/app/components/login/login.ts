import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

onSubmit(): void {
  this.errorMessage = '';

  if (!this.email?.trim() || !this.password?.trim()) {
    this.errorMessage = 'Por favor ingrese email y contraseña';
    return;
  }

  this.isLoading = true;

  this.auth.login(this.email.trim(), this.password.trim())
    .subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.status !== 'success') {
          this.errorMessage = response.mensaje || 'Credenciales inválidas';
        }
        // La redirección la hace el servicio
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage = 'Correo o contraseña incorrectos';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado';
        }

        console.error('Error en login:', error);
      }
    });
}

}
