import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirm-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './confirm-password.html',
  styleUrl: './confirm-password.css',
})
export class ConfirmPassword implements AfterViewInit {
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
  password: string = '';
  confirmPassword: string = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  recaptchaToken: string | null = null;

  // Solo acceder a window/grecaptcha en el navegador
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

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
    // Simulación de guardado
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = '¡Contraseña restablecida exitosamente!';
      this.password = '';
      this.confirmPassword = '';
      // Limpia el reCAPTCHA después de éxito
      if (this.isBrowser()) {
        (window as any).grecaptcha?.reset();
      }
      this.recaptchaToken = null;
    }, 1800);
  }
}
