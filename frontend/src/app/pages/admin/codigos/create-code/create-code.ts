import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';

interface Unit {
  id: number;
  name: string;
}

@Component({
  selector: 'app-create-code',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './create-code.html',
  styleUrl: './create-code.css',
})
export class CreateCode implements OnInit {
  code = '';
  name = '';
  description = '';
  unit_id: number | null = null;

  units: Unit[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    public router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  private loadUnits(): void {
    this.http.get<{ status: string; data: Unit[] }>(`${this.apiUrl}/units`).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.units = response.data;
        } else {
          this.errorMessage = 'No se pudieron cargar las unidades';
        }
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error al cargar las unidades';
        this.cd.detectChanges();
      },
    });
  }

  private validateForm(): boolean {
    if (!this.code.trim() || !this.name.trim() || !this.description.trim() || !this.unit_id) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return false;
    }

    if (this.code.trim().length > 20) {
      this.errorMessage = 'El código no puede superar 20 caracteres';
      return false;
    }

    if (this.name.trim().length > 100) {
      this.errorMessage = 'El nombre no puede superar 100 caracteres';
      return false;
    }

    if (this.description.trim().length > 1000) {
      this.errorMessage = 'La descripción no puede superar 1000 caracteres';
      return false;
    }

    return true;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      this.cd.detectChanges();
      return;
    }

    this.isLoading = true;

    const payload = {
      code: this.code.trim(),
      name: this.name.trim(),
      description: this.description.trim(),
      unit_id: this.unit_id,
    };

    this.http.post<any>(`${this.apiUrl}/admin/codes`, payload).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.status === 'success') {
          this.successMessage = 'Código creado correctamente';
          this.cd.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/codigos']);
          }, 900);
        } else {
          this.errorMessage = response.message || 'No se pudo crear el código';
          this.cd.detectChanges();
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error de conexión al servidor';
        this.cd.detectChanges();
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/codigos']);
  }
}