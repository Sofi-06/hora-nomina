import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { RouterLink } from '@angular/router';

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-list-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer, RouterLink],
  templateUrl: './list-departments.html',
  styleUrl: './list-departments.css',
})
export class ListDepartments implements OnInit {
  departments: Department[] = [];
  departmentsFiltered: Department[] = [];
  searchTerm: string = '';
  loading = false;
  error = '';
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${this.apiUrl}/admin/departments`).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.departments = response.data;
          if (this.searchTerm.trim()) {
            this.buscar();
          } else {
            this.departmentsFiltered = this.departments;
          }
        } else {
          this.error = response.message || 'No se pudieron cargar los departamentos';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error de conexion al servidor';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buscar(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.departmentsFiltered = this.departments;
      return;
    }

    this.departmentsFiltered = this.departments.filter((d) =>
      d.name.toLowerCase().includes(term)
    );
  }

  eliminarDepartamento(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este departamento?')) {
      return;
    }

    this.http.delete<any>(`${this.apiUrl}/admin/departments/${id}`).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.departments = this.departments.filter((d) => d.id !== id);
          this.departmentsFiltered = this.departmentsFiltered.filter((d) => d.id !== id);
          this.cdr.detectChanges();
        } else {
          alert(response.message || 'Error al eliminar el departamento');
        }
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error de conexion al eliminar el departamento');
      },
    });
  }
}