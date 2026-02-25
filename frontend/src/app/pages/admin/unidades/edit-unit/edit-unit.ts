import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-unit',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-unit.html',
  styleUrl: './edit-unit.css',
})
export class EditUnit implements OnInit {
  @Input() unitId!: number;
  @Output() unitUpdated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  name: string = '';
  loading: boolean = false;
  loadingData: boolean = true;
  error: string | null = null;
  successMessage: string | null = null;

  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarUnidad();
  }

  cargarUnidad(): void {
    this.loadingData = true;
    this.http.get<any>(`${this.apiUrl}/admin/units/${this.unitId}`).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.name = response.data.name;
          this.loadingData = false;
          this.cdr.detectChanges();
        } else {
          this.error = response.message || 'Error al cargar la unidad';
          this.loadingData = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error de conexión al servidor';
        this.loadingData = false;
        this.cdr.detectChanges();
      },
    });
  }

  actualizarUnidad(): void {
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

    this.http.put<any>(`${this.apiUrl}/admin/units/${this.unitId}`, payload).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.successMessage = 'Unidad actualizada correctamente';
          this.loading = false;
          this.cdr.detectChanges();
          
          // Esperar 1 segundo y cerrar el modal
          setTimeout(() => {
            this.unitUpdated.emit();
          }, 1000);
        } else {
          this.error = response.message || 'Error al actualizar la unidad';
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