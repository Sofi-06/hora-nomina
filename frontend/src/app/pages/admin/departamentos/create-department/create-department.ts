import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.prod';

@Component({
  selector: 'app-create-department',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-department.html',
  styleUrl: './create-department.css',
})
export class CreateDepartment {
  @Output() departmentCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  name = '';
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  crearDepartamento(): void {
    if (!this.name || this.name.trim() === '') {
      this.error = 'El nombre del departamento es obligatorio';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.http.post<any>(`${environment.apiUrl}/admin/departments`, { name: this.name.trim() }).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.successMessage = 'Departamento creado correctamente';
          this.name = '';
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.departmentCreated.emit(), 1000);
        } else {
          this.error = response.message || 'Error al crear el departamento';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
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