import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { ChangeDetectorRef } from '@angular/core';

interface Department {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
}

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser implements OnInit {
  userId: string | null = null;
  name = '';
  email = '';
  password = '';
  user_type: 'Admin' | 'Docente' | 'Director' = 'Docente';
  identification_type: 'CC' | 'CE' = 'CC';
  identification = '';
  gender: 'Femenino' | 'Masculino' = 'Femenino';
  state: 'Activo' | 'Inactivo' = 'Activo';
  department_id: number | null = null;
  unit_ids: number[] = [];

  departments: Department[] = [];
  units: Unit[] = [];

  isLoading = false;
  isLoadingUser = true;
  errorMessage = '';
  successMessage = '';
  passwordChanged = false;

  private apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser();
    }
    this.loadDepartments();
    this.loadUnits();
  }

  private loadUser(): void {
    this.http.get<any>(`${this.apiUrl}/admin/users/${this.userId}`).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          const user = response.data;
          this.name = user.name;
          this.email = user.email;
          this.user_type = user.user_type;
          this.identification_type = user.identification_type;
          this.identification = user.identification;
          this.gender = user.gender;
          this.department_id = user.department_id || null;
          this.unit_ids = user.unit_ids || [];
          this.isLoadingUser = false;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el usuario';
        this.isLoadingUser = false;
      },
    });
  }

  private loadDepartments(): void {
    this.http.get<{ status: string; data: Department[] }>(`${this.apiUrl}/departments`).subscribe({
      next: (response) => {
        this.departments = response.data;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los departamentos';
      },
    });
  }

  private loadUnits(): void {
    this.http.get<{ status: string; data: Unit[] }>(`${this.apiUrl}/units`).subscribe({
      next: (response) => {
        this.units = response.data;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar las unidades';
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.identification.trim()
    ) {
      this.errorMessage = 'Completa todos los campos obligatorios';
      return;
    }

    if (this.passwordChanged && !this.password.trim()) {
      this.errorMessage = 'La contraseña es requerida si deseas cambiarla';
      return;
    }

    this.isLoading = true;

    const payload: any = {
      name: this.name.trim(),
      email: this.email.trim(),
      user_type: this.user_type,
      identification_type: this.identification_type,
      identification: this.identification.trim(),
      gender: this.gender,
      state: this.state,
      department_id: this.department_id || null,
      unit_ids: this.unit_ids && this.unit_ids.length > 0 ? this.unit_ids : null,
    };

    if (this.passwordChanged && this.password.trim()) {
      payload.password = this.password;
    }

    this.http.put<any>(`${this.apiUrl}/admin/users/${this.userId}`, payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.successMessage = 'Usuario actualizado correctamente';
          setTimeout(() => this.router.navigate(['/usuarios']), 800);
        } else {
          this.errorMessage = response.message || 'No se pudo actualizar el usuario';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Error al actualizar el usuario';
      },
    });
  }

  onPasswordChange(): void {
    this.passwordChanged = true;
  }

  trackByDeptId(index: number, dept: Department): number {
    return dept.id;
  }

  trackByUnitId(index: number, unit: Unit): number {
    return unit.id;
  }
}