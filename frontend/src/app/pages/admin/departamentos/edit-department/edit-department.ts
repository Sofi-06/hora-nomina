import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-department',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-department.html',
  styleUrl: './edit-department.css',
})
export class EditDepartment implements OnInit {
  @Input() departmentId!: number;
  @Output() departmentUpdated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  name = '';
  loading = false;
  loadingData = true;
  error: string | null = null;
  successMessage: string | null = null;
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDepartamento();
  }

  cargarDepartamento(): void {
    this.loadingData = true;
    this.http.get<any>(`${this.apiUrl}/admin/departments/${this.departmentId}`).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.name = response.data.name;
        } else {
          this.error = response.message || 'Error al cargar el departamento';
        }
        this.loadingData = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error de conexión al servidor';
        this.loadingData = false;
        this.cdr.detectChanges();
      },
    });
  }

  actualizarDepartamento(): void {
    if (!this.name || this.name.trim() === '') {
      this.error = 'El nombre del departamento es obligatorio';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.http.put<any>(`${this.apiUrl}/admin/departments/${this.departmentId}`, { name: this.name.trim() }).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.successMessage = 'Departamento actualizado correctamente';
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.departmentUpdated.emit(), 1000);
        } else {
          this.error = response.message || 'Error al actualizar el departamento';
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