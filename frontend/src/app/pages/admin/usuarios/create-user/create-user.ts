// En frontend/src/app/pages/admin/usuarios/create-user/create-user.ts

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

interface Unit {
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
  unit_ids: number[] = [];  

  departments: Department[] = [];
  units: Unit[] = [];  

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Errores de validación 
  fieldErrors: { [key: string]: string } = {};

  private apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    public router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadUnits();
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

  // Validación de nombre
  validateName(): boolean {
    this.fieldErrors['name'] = '';
    
    if (!this.name.trim()) {
      this.fieldErrors['name'] = 'El nombre es requerido';
      return false;
    }
    
    if (this.name.trim().length < 3) {
      this.fieldErrors['name'] = 'El nombre debe tener al menos 3 caracteres';
      return false;
    }
    
    if (this.name.trim().length > 100) {
      this.fieldErrors['name'] = 'El nombre no puede exceder 100 caracteres';
      return false;
    }
    
    // Validar que solo contenga letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.name.trim())) {
      this.fieldErrors['name'] = 'El nombre solo puede contener letras y espacios';
      return false;
    }
    
    return true;
  }

  // Validación de email
  validateEmail(): boolean {
    this.fieldErrors['email'] = '';
    
    if (!this.email.trim()) {
      this.fieldErrors['email'] = 'El email es requerido';
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.fieldErrors['email'] = 'El email no es válido';
      return false;
    }
    
    return true;
  }

  // Validación de contraseña
  validatePassword(): boolean {
    this.fieldErrors['password'] = '';
    
    if (!this.password.trim()) {
      this.fieldErrors['password'] = 'La contraseña es requerida';
      return false;
    }
    
    if (this.password.length < 6) {
      this.fieldErrors['password'] = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }
    
    if (this.password.length > 50) {
      this.fieldErrors['password'] = 'La contraseña no puede exceder 50 caracteres';
      return false;
    }
    
    // Validar que tenga al menos una mayúscula y un número
    if (!/[A-Z]/.test(this.password)) {
      this.fieldErrors['password'] = 'La contraseña debe contener al menos una mayúscula';
      return false;
    }
    
    if (!/[0-9]/.test(this.password)) {
      this.fieldErrors['password'] = 'La contraseña debe contener al menos un número';
      return false;
    }
    
    return true;
  }

  // Validación de identificación
  validateIdentification(): boolean {
    this.fieldErrors['identification'] = '';
    
    if (!this.identification.trim()) {
      this.fieldErrors['identification'] = 'La identificación es requerida';
      return false;
    }
    
    if (this.identification.trim().length < 5) {
      this.fieldErrors['identification'] = 'La identificación debe tener al menos 5 caracteres';
      return false;
    }
    
    if (this.identification.trim().length > 20) {
      this.fieldErrors['identification'] = 'La identificación no puede exceder 20 caracteres';
      return false;
    }
    
    // Validar que solo contenga números y letras
    if (!/^[a-zA-Z0-9]+$/.test(this.identification.trim())) {
      this.fieldErrors['identification'] = 'La identificación solo puede contener números y letras';
      return false;
    }
    
    return true;
  }

  // Validación de tipo de ID
  validateIdentificationType(): boolean {
    this.fieldErrors['identification_type'] = '';
    
    if (!this.identification_type) {
      this.fieldErrors['identification_type'] = 'El tipo de identificación es requerido';
      return false;
    }
    
    return true;
  }

  // Validación de género
  validateGender(): boolean {
    this.fieldErrors['gender'] = '';
    
    if (!this.gender) {
      this.fieldErrors['gender'] = 'El género es requerido';
      return false;
    }
    
    return true;
  }

  // Validación de rol
  validateUserType(): boolean {
    this.fieldErrors['user_type'] = '';
    
    if (!this.user_type) {
      this.fieldErrors['user_type'] = 'El rol es requerido';
      return false;
    }
    
    return true;
  }

  // Validación de departamento
  validateDepartment(): boolean {
    this.fieldErrors['department_id'] = '';
    
    if (!this.department_id) {
      this.fieldErrors['department_id'] = 'El departamento es requerido';
      return false;
    }
    
    return true;
  }

  // Validación de unidades
  validateUnits(): boolean {
    this.fieldErrors['unit_ids'] = '';
    
    if (!this.unit_ids || this.unit_ids.length === 0) {
      this.fieldErrors['unit_ids'] = 'Debes seleccionar al menos una unidad';
      return false;
    }
    
    return true;
  }

  // Método general de validación
  validateForm(): boolean {
    this.fieldErrors = {};
    
    const isNameValid = this.validateName();
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    const isIdentificationTypeValid = this.validateIdentificationType();
    const isIdentificationValid = this.validateIdentification();
    const isGenderValid = this.validateGender();
    const isUserTypeValid = this.validateUserType();
    const isDepartmentValid = this.validateDepartment();
    const isUnitsValid = this.validateUnits();
    
    return isNameValid && isEmailValid && isPasswordValid && 
           isIdentificationTypeValid && isIdentificationValid && 
           isGenderValid && isUserTypeValid && isDepartmentValid && isUnitsValid;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Ejecutar validaciones
    if (!this.validateForm()) {
      this.errorMessage = 'Por favor, corrige los errores en el formulario';
      this.cd.detectChanges();
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
      department_id: this.department_id,
      unit_ids: this.unit_ids,
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

  trackByUnitId(index: number, unit: Unit): number {
    return unit.id;
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
    this.unit_ids = [];
    this.fieldErrors = {};
  }
}