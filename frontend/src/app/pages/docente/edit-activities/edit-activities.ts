import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavComponent } from '../../../components/nav-component/nav-component';
import { Footer } from '../../../components/footer/footer';
import { Auth } from '../../../services/auth';

interface Unit {
  id: number;
  name: string;
}

interface Code {
  id: number;
  code: string;
  name: string;
  unit_id: number;
}

interface ActivityType {
  id: number;
  name: string;
  code_id: number;
}

@Component({
  selector: 'app-edit-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './edit-activities.html',
  styleUrl: './edit-activities.css',
})
export class EditActivities implements OnInit {
    activityId: number | null = null;

    ngOnInit(): void {
      // Obtener el ID de la actividad desde la ruta
      const url = this.router.url;
      const match = url.match(/editarActividad\/(\d+)/);
      this.activityId = match ? Number(match[1]) : null;
      if (this.activityId) {
        this.loadActivity(this.activityId);
      }
      this.loadInitialData();
      const usuario = this.auth.getUsuarioActual();
      this.userId = usuario?.id || null;
    }

    loadActivity(id: number): void {
      this.isLoading = true;
      this.http.get<any>(`${this.apiUrl}/docente/activities/${id}`).subscribe({
        next: (res) => {
          const data = res?.data ?? res;
          this.selectedUnit = data.unit_id ?? null;
          this.selectedCode = data.code_id ?? null;
          this.selectedActivityType = data.type_id ?? null;
          this.dedicatedHours = data.hours ?? null;
          this.description = data.description ?? '';
          this.currentMonth = data.month ?? '';
          // No se carga archivo por seguridad
          this.isLoading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar la actividad.';
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    }

    loadInitialData(): void {
      this.loadUnits();
      this.loadActivityTypes();
    }

    loadUnits(): void {
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

    loadActivityTypes(): void {
      this.http.get<{ status: string; data: ActivityType[] }>(`${this.apiUrl}/docente/types`).subscribe({
        next: (response) => {
          if (response.status === 'success' && Array.isArray(response.data)) {
            this.activityTypes = response.data;
          } else {
            this.activityTypes = [];
          }
          this.cd.detectChanges();
        },
        error: () => {
          this.activityTypes = [];
          this.errorMessage = 'Error al cargar los tipos de actividad';
          this.cd.detectChanges();
        },
      });
    }

    onSubmit(): void {
      if (!this.activityId || !this.isFormValid()) return;
      this.isLoading = true;
      const formData = new FormData();
      formData.append('unit_id', String(this.selectedUnit));
      formData.append('code_id', String(this.selectedCode));
      formData.append('type_id', String(this.selectedActivityType));
      formData.append('hours', String(this.dedicatedHours));
      formData.append('description', this.description);
      formData.append('month', this.currentMonth);
      if (this.selectedFile) {
        formData.append('evidence_file', this.selectedFile);
      }
      this.http.put(`${this.apiUrl}/docente/activities/${this.activityId}`, formData).subscribe({
        next: () => {
          this.successMessage = 'Actividad actualizada correctamente';
          this.isLoading = false;
          this.cd.detectChanges();
          setTimeout(() => this.router.navigate(['/docente']), 1500);
        },
        error: () => {
          this.errorMessage = 'Error al actualizar la actividad';
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    }
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  selectedUnit: number | null = null;
  selectedCode: number | null = null;
  selectedActivityType: number | null = null;
  dedicatedHours: number | null = null;
  description = '';
  selectedFile: File | null = null;

  units: Unit[] = [];
  codes: Code[] = [];
  activityTypes: ActivityType[] = [];

  currentMonth = '';
  private apiUrl = 'http://localhost:8000';
  private userId: number | null = null;

  constructor(
    private http: HttpClient,
    public router: Router,
    private cd: ChangeDetectorRef,
    private auth: Auth
  ) {}

  // ...existing code...

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  cancelar(): void {
    this.router.navigate(['/docente']);
  }

  isFormValid(): boolean {
    return (
      this.selectedUnit !== null &&
      this.selectedCode !== null &&
      this.selectedActivityType !== null &&
      this.dedicatedHours !== null &&
      this.description.trim().length > 0 &&
      this.selectedFile !== null
    );
  }
}
