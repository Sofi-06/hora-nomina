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
        onUnitChange(): void {
          this.selectedCode = null;
          this.selectedActivityType = null;
          this.loadCodesByUnit();
        }

        private loadCodesByUnit(): void {
          if (!this.selectedUnit) {
            this.codes = [];
            return;
          }
          this.http.get<{ status: string; data: Code[] }>(`${this.apiUrl}/docente/codes`).subscribe({
            next: (response) => {
              if (response.status === 'success' && Array.isArray(response.data)) {
                this.codes = response.data.filter(code => code.unit_id === this.selectedUnit);
              } else {
                this.codes = [];
              }
              this.cd.detectChanges();
            },
            error: () => {
              this.codes = [];
              this.cd.detectChanges();
            },
          });
        }

        onCodeChange(): void {
          this.selectedActivityType = null;
          this.loadTypesByCode();
        }

        private loadTypesByCode(): void {
          if (!this.selectedCode) {
            this.activityTypes = [];
            return;
          }
          this.http.get<{ status: string; data: ActivityType[] }>(`${this.apiUrl}/docente/types`).subscribe({
            next: (response) => {
              if (response.status === 'success' && Array.isArray(response.data)) {
                this.activityTypes = response.data.filter(type => type.code_id === this.selectedCode);
              } else {
                this.activityTypes = [];
              }
              this.cd.detectChanges();
            },
            error: () => {
              this.activityTypes = [];
              this.cd.detectChanges();
            },
          });
        }
    activityId: number | null = null;

    ngOnInit(): void {
      // Obtener el ID de la actividad desde la ruta
      const url = this.router.url;
      const regex = /editarActividad\/(\d+)/;
      const match = regex.exec(url);
      this.activityId = match ? Number(match[1]) : null;
      if (this.activityId) {
        this.loadActivityAndPrefill(this.activityId);
      } else {
        this.loadInitialData();
      }
      const usuario = this.auth.getUsuarioActual();
      this.userId = usuario?.id || null;
    }

    /**
     * Carga la actividad y prellena los combos de unidad, código y tipo, manteniendo los filtros correctos.
     */
    loadActivityAndPrefill(id: number): void {
      this.isLoading = true;
      // 1. Cargar la actividad
      this.http.get<any>(`${this.apiUrl}/docente/activities/${id}`).subscribe({
        next: (res) => {
          const data = res?.data ?? res;
          // Guardar los valores a preseleccionar
          const unitId = data.unit_id ?? null;
          const codeId = data.code_id ?? null;
          const typeId = data.type_id ?? null;
          this.dedicatedHours = data.hours ?? null;
          this.description = data.description ?? '';
          this.currentMonth = data.month ?? '';
          this.evidenceFileName = data.evidence_file ?? null;
          this.codeValue = data.code_value ?? null;
          this.codeName = data.code_name ?? null;
          // 2. Cargar todas las unidades
          this.http.get<{ status: string; data: Unit[] }>(`${this.apiUrl}/units`).subscribe({
            next: (unitRes) => {
              if (unitRes.status === 'success' && Array.isArray(unitRes.data)) {
                this.units = unitRes.data;
                this.selectedUnit = unitId;
                this.cd.detectChanges();
                // 3. Cargar los códigos filtrados por unidad
                this.http.get<{ status: string; data: Code[] }>(`${this.apiUrl}/docente/codes`).subscribe({
                  next: (codeRes) => {
                    if (codeRes.status === 'success' && Array.isArray(codeRes.data)) {
                      this.codes = codeRes.data.filter(code => code.unit_id === unitId);
                      this.selectedCode = codeId;
                      this.cd.detectChanges();
                      // 4. Cargar los tipos filtrados por código
                      this.http.get<{ status: string; data: ActivityType[] }>(`${this.apiUrl}/docente/types`).subscribe({
                        next: (typeRes) => {
                          if (typeRes.status === 'success' && Array.isArray(typeRes.data)) {
                            this.activityTypes = typeRes.data.filter(type => type.code_id === codeId);
                            this.selectedActivityType = typeId;
                          } else {
                            this.activityTypes = [];
                          }
                          this.isLoading = false;
                          this.cd.detectChanges();
                        },
                        error: () => {
                          this.activityTypes = [];
                          this.isLoading = false;
                          this.cd.detectChanges();
                        }
                      });
                    } else {
                      this.codes = [];
                      this.isLoading = false;
                      this.cd.detectChanges();
                    }
                  },
                  error: () => {
                    this.codes = [];
                    this.isLoading = false;
                    this.cd.detectChanges();
                  }
                });
              } else {
                this.units = [];
                this.isLoading = false;
                this.cd.detectChanges();
              }
            },
            error: () => {
              this.units = [];
              this.isLoading = false;
              this.cd.detectChanges();
            }
          });
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar la actividad.';
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    }

    evidenceFileName: string | null = null;
    codeValue: string | null = null;
    codeName: string | null = null;
    codeId: number | null = null;
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
          this.evidenceFileName = data.evidence_file ?? null;
          this.codeValue = data.code_value ?? null;
          this.codeName = data.code_name ?? null;
          this.codeId = data.code_id ?? null;
          // El código actual debe estar en la lista, pero la lista debe contener todos los códigos de la BD
          // Si ya existe, no se duplica
          // Si la lista está vacía (por ejemplo, si la carga de códigos es asíncrona), se espera a que loadCodes() la llene
          // Si la lista ya tiene códigos, se asegura que el actual esté incluido
          if (this.codeId && this.codeValue && this.codeName) {
            const exists = this.codes.some(c => c.id === this.codeId);
            if (!exists && this.codes.length > 0) {
              this.codes.push({
                id: this.codeId,
                code: this.codeValue,
                name: this.codeName,
                unit_id: this.selectedUnit ?? 0
              });
            }
          }
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
      formData.append('user_id', String(this.userId));
      formData.append('type_id', String(this.selectedActivityType));
      formData.append('unit_id', String(this.selectedUnit));
      formData.append('dedicated_hours', String(this.dedicatedHours));
      formData.append('description', this.description);
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
  private readonly apiUrl = 'http://localhost:8000';
  private userId: number | null = null;

  constructor(
    private readonly http: HttpClient,
    public router: Router,
    private readonly cd: ChangeDetectorRef,
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
      (this.selectedFile !== null || this.evidenceFileName !== null)
    );
  }
}
