import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';

interface Unit {
  id: number;
  name: string;
}

@Component({
  selector: 'app-edit-code',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './edit-code.html',
  styleUrl: './edit-code.css',
})
export class EditCode implements OnInit {
  codeId: string | null = null;

  code = '';
  name = '';
  description = '';
  unit_id: number | null = null;

  units: Unit[] = [];

  isLoading = false;
  isLoadingCode = true;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.codeId = this.route.snapshot.paramMap.get('id');

    if (!this.codeId) {
      this.errorMessage = 'ID de código inválido';
      this.isLoadingCode = false;
      return;
    }

    this.loadUnits();
    this.loadCode();
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

  private loadCode(): void {
    this.http.get<any>(`${this.apiUrl}/admin/codes/${this.codeId}`).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const item = response.data;
          this.code = item.code || '';
          this.name = item.name || '';
          this.description = item.description || '';
          this.unit_id = item.unit_id ?? null;
        } else {
          this.errorMessage = response.message || 'No se pudo cargar el código';
        }
        this.isLoadingCode = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error al cargar el código';
        this.isLoadingCode = false;
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

    this.http.put<any>(`${this.apiUrl}/admin/codes/${this.codeId}`, payload).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.status === 'success') {
          this.successMessage = 'Código actualizado correctamente';
          this.cd.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/codigos']);
          }, 900);
        } else {
          this.errorMessage = response.message || 'No se pudo actualizar el código';
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Error de conexión al servidor';
        this.cd.detectChanges();
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/codigos']);
  }
}