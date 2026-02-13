import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { ChangeDetectorRef } from '@angular/core';

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser implements OnInit {
  name = '';
  email = '';
  password = '';
  user_type: 'Admin' | 'Docente' | 'Director' = 'Docente';
  identification_type: 'CC' | 'CE' = 'CC';
  identification = '';
  gender: 'Femenino' | 'Masculino' = 'Femenino';
  state: 'Activo' | 'Inactivo' = 'Activo';
  department_id: number | null = null;

  departments: Department[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
      this.loadDepartments();
    
  }

private loadDepartments(): void {
  console.log('🔍 Intentando cargar departamentos...');
  
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

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password.trim() ||
      !this.identification.trim()
    ) {
      this.errorMessage = 'Completa todos los campos obligatorios';
      return;
    }

    this.isLoading = true;

    const payload = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      user_type: this.user_type,
      identification_type: this.identification_type,
      identification: this.identification.trim(),
      gender: this.gender,
      state: this.state,
      department_id: this.department_id || null,
    };

    this.http.post<any>(`${this.apiUrl}/admin/users`, payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.successMessage = 'Usuario creado correctamente';
          this.resetForm();
          setTimeout(() => this.router.navigate(['/usuarios']), 800);
        } else {
          this.errorMessage = response.message || 'No se pudo crear el usuario';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Error al crear el usuario';
      },
    });
  }
trackByDeptId(index: number, dept: Department): number {
  return dept.id;
}
  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.password = '';
    this.user_type = 'Docente';
    this.identification_type = 'CC';
    this.identification = '';
    this.gender = 'Femenino';
    this.state = 'Activo';
    this.department_id = null;

  }
}
