import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { timeout } from 'rxjs';

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

        if (response.status === 'success' && response.usuario) {
          // Guardar usuario y redirigir
          if (typeof window !== 'undefined') {
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
          }
          this.auth.getUsuarioActual(); // Actualizar estado
          this.redirectByRole(response.usuario.role);
        } else {
          this.errorMessage = response.mensaje || 'Credenciales inválidas';
          this.password = '';
        }
      },
      error: (error) => {
        
        this.isLoading = false;
        this.password = '';

        if (error.status === 401 || error.status === 400) {
          alert('Correo o contraseña incorrectos');
        } else if (error.status === 0 || error.name === 'TimeoutError' || error.error === 'timeout') {
          this.errorMessage = 'No se puede conectar con el servidor. Verifique que esté ejecutándose.';
        } else if (error.status >= 500) {
          this.errorMessage = 'Error del servidor. Intente más tarde.';
        } else {
          this.errorMessage = 'Error de conexión. Intente de nuevo.';
        }

        console.error('Error en login:', error);
      }
    });
}

private redirectByRole(role: string): void {
  switch (role.toLowerCase()) {
    case 'admin':
      this.router.navigate(['/admin']);
      break;
    case 'docente':
      this.router.navigate(['/docente']);
      break;
    case 'director':
      this.router.navigate(['/director']);
      break;
    default:
      this.router.navigate(['/home']);
  }
}

}
