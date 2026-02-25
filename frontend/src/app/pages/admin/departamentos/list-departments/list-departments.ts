import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { CreateDepartment } from '../create-department/create-department';
import { EditDepartment } from '../edit-department/edit-department';

interface Department {
  id: number;
  name: string;
  total_docentes: number;
}

@Component({
  selector: 'app-list-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer, CreateDepartment, EditDepartment],
  templateUrl: './list-departments.html',
  styleUrl: './list-departments.css',
})
export class ListDepartments implements OnInit {
  departments: Department[] = [];
  departmentsFiltered: Department[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  showCreateModal = false;
  showEditModal = false;
  selectedDepartmentId: number | null = null;
  private apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${this.apiUrl}/admin/departments`).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.departments = response.data;
          this.departmentsFiltered = this.searchTerm.trim()
            ? this.departments.filter((d) =>
                d.name.toLowerCase().includes(this.searchTerm.trim().toLowerCase()),
              )
            : this.departments;
        } else {
          this.error = response.message || 'No se pudieron cargar los departamentos';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error de conexion al servidor';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buscar(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.departmentsFiltered = !term
      ? this.departments
      : this.departments.filter((d) => d.name.toLowerCase().includes(term));
  }

  abrirCreateModal(): void {
    this.showCreateModal = true;
  }
  closeCreateModal(): void {
    this.showCreateModal = false;
  }
  onDepartmentCreated(): void {
    this.showCreateModal = false;
    this.loadDepartments();
  }

  abrirEditModal(id: number): void {
    this.selectedDepartmentId = id;
    this.showEditModal = true;
  }
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedDepartmentId = null;
  }
  onDepartmentUpdated(): void {
    this.showEditModal = false;
    this.selectedDepartmentId = null;
    this.loadDepartments();
  }

  eliminarDepartamento(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este departamento?')) return;
    this.http.delete<any>(`${this.apiUrl}/admin/departments/${id}`).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.departments = this.departments.filter((d) => d.id !== id);
          this.departmentsFiltered = this.departmentsFiltered.filter((d) => d.id !== id);
          this.cdr.detectChanges();
        } else {
          alert(response.message || 'Error al eliminar el departamento');
        }
      },
      error: () => alert('Error de conexion al eliminar el departamento'),
    });
  }
}
