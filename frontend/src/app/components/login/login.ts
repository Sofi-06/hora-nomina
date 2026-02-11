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
    this.isLoading = true;

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingrese email y contraseña';
      this.isLoading = false;
      return;
    }

    this.auth.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'error') {
          this.errorMessage = response.mensaje;
        }
        // La redirección se maneja en el servicio
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.detail && error.error.detail.mensaje) {
          this.errorMessage = error.error.detail.mensaje;
        } else {
          this.errorMessage = 'Error de conexión. Intente nuevamente.';
        }
        console.error('Error en login:', error);
      }
    });
  }
}
