import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import {ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './email.html',
  styleUrls: ['./email.css'],
})
export class Email {
  email: string = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  onSubmit() {
  this.successMessage = '';
  this.errorMessage = '';

  if (!this.email || !this.email.includes('@')) {
    this.errorMessage = 'Por favor ingresa un correo válido.';
    this.cdr.detectChanges();
    return;
  }

  this.isLoading = true;

  this.authService.forgotPassword(this.email).subscribe({
    next: (response) => {
      this.isLoading = false;
      if (response.status === 'success') {
        this.successMessage = '¡Revisa tu correo! Te hemos enviado un enlace para restablecer tu contraseña.';
        this.email = '';
      } else {
        this.errorMessage = response.mensaje || 'Error al enviar el correo.';
      }
      this.cdr.detectChanges();
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Error:', error);

      if (error?.error === 'timeout' || error?.message?.includes('timeout')) {
        this.errorMessage = 'El servidor tardó demasiado. Intenta de nuevo.';
      } else if (error?.status === 404) {
        this.errorMessage = 'El correo no está registrado.';
        this.cdr.detectChanges();
      } else {
        this.errorMessage = error?.error?.detail?.mensaje || 'Error al enviar el correo. Intenta de nuevo.';
      }

      this.cdr.detectChanges();
    }
  });
}
}
