import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-unit',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-unit.html',
  styleUrl: './create-unit.css',
})
export class CreateUnit {
  @Output() unitCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  name: string = '';
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  crearUnidad(): void {
    // Validaciones
    if (!this.name || this.name.trim() === '') {
      this.error = 'El nombre de la unidad es obligatorio';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const payload = {
      name: this.name.trim()
    };

    this.http.post<any>(`${this.apiUrl}/admin/units`, payload).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.successMessage = 'Unidad creada correctamente';
          this.name = '';
          this.loading = false;
          this.cdr.detectChanges();
          
          // Esperar 1 segundo y cerrar el modal
          setTimeout(() => {
            this.unitCreated.emit();
          }, 1000);
        } else {
          this.error = response.message || 'Error al crear la unidad';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error de conexión al servidor';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancelar(): void {
    this.close.emit();
  }
}