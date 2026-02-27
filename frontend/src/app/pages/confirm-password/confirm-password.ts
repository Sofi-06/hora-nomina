import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-confirm-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './confirm-password.html',
  styleUrl: './confirm-password.css',
})
export class ConfirmPassword implements OnInit, AfterViewInit {
  password: string = '';
  confirmPassword: string = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  recaptchaToken: string | null = null;
  private resetToken: string = '';
  tokenValid = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: Auth
  ) { }

  ngOnInit() {
    // Leer el token de la URL (query param ?token=xxx)
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (!this.resetToken) {
        this.errorMessage = 'Enlace inválido. No se encontró el token de recuperación.';
        this.tokenValid = false;
      } else {
        this.tokenValid = true;
      }
    });
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      // Solo carga el script si no está ya cargado
      if (!(window as any).grecaptcha) {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }

  // Solo acceder a window/grecaptcha en el navegador
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    // Verificar que hay token
    if (!this.resetToken) {
      this.errorMessage = 'Enlace inválido. Solicita un nuevo enlace de recuperación.';
      return;
    }

    // Verifica el token de reCAPTCHA solo en navegador
    let recaptchaResponse = '';
    if (this.isBrowser()) {
      recaptchaResponse = (window as any).grecaptcha?.getResponse() || '';
    }
    if (!recaptchaResponse) {
      this.errorMessage = 'Por favor verifica el reCAPTCHA.';
      return;
    }
    this.recaptchaToken = recaptchaResponse;

    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa ambos campos.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.resetToken, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.successMessage = '¡Contraseña restablecida exitosamente! Redirigiendo al login...';
          this.password = '';
          this.confirmPassword = '';
          // Limpia el reCAPTCHA después de éxito
          if (this.isBrowser()) {
            (window as any).grecaptcha?.reset();
          }
          this.recaptchaToken = null;

          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.mensaje || 'Error al restablecer la contraseña.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error:', error);

        // Limpia reCAPTCHA on error para que el usuario pueda reintentar
        if (this.isBrowser()) {
          (window as any).grecaptcha?.reset();
        }

        if (error?.error === 'timeout' || error?.message?.includes('timeout')) {
          this.errorMessage = 'El servidor tardó demasiado. Intenta de nuevo.';
        } else {
          this.errorMessage = error?.error?.detail?.mensaje || 'Error al restablecer la contraseña. El enlace puede haber expirado.';
        }
      }
    });
  }
}
