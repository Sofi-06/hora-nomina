import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './email.html',
  styleUrls: ['./email.css'],
})
export class Email {
  email: string = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Por favor ingresa un correo válido.';
      return;
    }
    this.isLoading = true;
    // Simulación de envío
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = '¡Revisa tu correo! Te hemos enviado un enlace para restablecer tu contraseña.';
      this.email = '';
    }, 1800);
  }
}
