import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: Auth,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.auth.redirigirUsuarioActual();
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email?.trim() || !this.password?.trim()) {
      this.errorMessage = 'Por favor ingrese email y contraseña';
      return;
    }

    this.isLoading = true;

    this.auth.login(this.email.trim(), this.password.trim()).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.status === 'success' && response.usuario) {
          
          if (globalThis.window !== undefined) {
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
          }

          this.auth.actualizarUsuario(response.usuario);
          this.auth.redirigirPorRol(response.usuario.role);
        } else {
          this.errorMessage = response.mensaje || 'Credenciales inválidas';
          this.password = '';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.password = '';

        if (error.status === 401 || error.status === 400) {
          this.errorMessage = 'Correo o contraseña incorrectos';
        } else if (error.status === 403) {
          this.errorMessage = error?.error?.detail?.mensaje || 'Usuario inactivo';
        } else if (
          error.status === 0 ||
          error.name === 'TimeoutError' ||
          error.error === 'timeout'
        ) {
          this.errorMessage =
            'No se puede conectar con el servidor. Verifique que esté ejecutándose.';
        } else if (error.status >= 500) {
          this.errorMessage = 'Error del servidor. Intente más tarde.';
        } else {
          this.errorMessage = 'Error de conexión. Intente de nuevo.';
        }

        this.cd.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cd.detectChanges();
        }, 2000);
      },
    });
  }

}
