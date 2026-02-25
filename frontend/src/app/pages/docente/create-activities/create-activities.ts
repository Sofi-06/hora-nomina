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
  selector: 'app-create-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './create-activities.html',
  styleUrl: './create-activities.css',
})
export class CreateActivities implements OnInit {
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  selectedActivityType: number | null = null;
  selectedCode: number | null = null;
  selectedUnit: number | null = null;
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

  ngOnInit(): void {
    this.setCurrentMonth();
    this.loadUnits();
    const usuario = this.auth.getUsuarioActual();
    this.userId = usuario?.id || null;
  }

  onUnitChange(): void {
    this.selectedCode = null;
    this.selectedActivityType = null;
    this.loadCodesByUnit();
  }

  private loadUnits(): void {
    this.http.get<{ status: string; data: Unit[] }>(`${this.apiUrl}/units`).subscribe({
      next: (response) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.units = response.data;
        } else {
          this.units = [];
        }
        this.cd.detectChanges();
      },
      error: () => {
        this.units = [];
        this.cd.detectChanges();
      },
    });
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

  private setCurrentMonth(): void {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const now = new Date();
    let prevMonth = now.getMonth() - 1;
    let year = now.getFullYear();
    if (prevMonth < 0) {
      prevMonth = 11;
      year = year - 1;
    }
    this.currentMonth = monthNames[prevMonth] + ' ' + year;
  }





  private loadActivityTypes(): void {
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



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedFormats = ['doc', 'docx', 'xml', 'pdf', 'xlsx', 'zip', 'rar'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension && allowedFormats.includes(fileExtension)) {
        this.selectedFile = file;
        this.errorMessage = '';
      } else {
        this.selectedFile = null;
        this.errorMessage = 'Formato de archivo no permitido. Formatos aceptados: .doc .docx .xml .pdf .xlsx .zip .rar';
      }
      this.cd.detectChanges();
    }
  }

  // Forzar actualización del nombre del archivo al cambiar cualquier campo
  ngDoCheck(): void {
    this.cd.detectChanges();
  }

  getSelectedFileName(): string {
    return this.selectedFile ? this.selectedFile.name : '';
  }

  isFormValid(): boolean {
    return (
      this.selectedActivityType !== null &&
      this.selectedCode !== null &&
      this.selectedUnit !== null &&
      this.dedicatedHours !== null &&
      this.dedicatedHours >= 0 &&
      this.dedicatedHours <= 40 &&
      this.description.trim().length > 0 &&
      this.selectedFile !== null
    );
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      this.cd.detectChanges();
      return;
    }

    if (!this.userId) {
      this.errorMessage = 'Error: usuario no identificado';
      this.cd.detectChanges();
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('user_id', this.userId.toString());
    formData.append('type_id', (this.selectedActivityType || '').toString());
    formData.append('dedicated_hours', (this.dedicatedHours || '').toString());
    formData.append('description', this.description.trim());
    if (this.selectedFile) {
      formData.append('evidence_file', this.selectedFile, this.selectedFile.name);
    }

    this.http.post<any>(`${this.apiUrl}/docente/activities`, formData).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.status === 'success') {
          this.successMessage = 'Actividad creada correctamente';
          this.cd.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/docente']);
          }, 900);
        } else {
          this.errorMessage = response.message || 'No se pudo crear la actividad';
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
    this.router.navigate(['/docente']);
  }
}
