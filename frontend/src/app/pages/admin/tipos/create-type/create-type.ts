import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-type.html',
  styleUrl: './create-type.css',
})
export class CreateType {
  @Input() isOpen = false;
  @Input() codeId: number | null = null;
  @Input() codeName: string = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() typeCreated = new EventEmitter<any>();

  name: string = '';
  loading = false;
  error = '';

  constructor(private readonly http: HttpClient) {}

  close(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  private resetForm(): void {
    this.name = '';
    this.error = '';
  }

  agregar(): void {
    if (!this.name.trim()) {
      this.error = 'El nombre del tipo es requerido';
      return;
    }

    if (!this.codeId) {
      this.error = 'ID de código no válido';
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post<any>(`http://localhost:8000/admin/types`, {
      name: this.name.trim(),
      code_id: this.codeId
    }).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.typeCreated.emit(response.type);
          this.close();
        } else {
          this.error = response.message || 'Error al crear el tipo';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error de conexión al servidor';
        this.loading = false;
      }
    });
  }
}
