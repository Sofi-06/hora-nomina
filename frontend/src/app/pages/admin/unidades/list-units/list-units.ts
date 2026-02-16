import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CreateUnit } from '../create-unit/create-unit';
import { EditUnit } from '../edit-unit/edit-unit';

interface Unit {
  id: number;
  name: string;
  total_codes: number;
  total_docentes: number;
}

@Component({
  selector: 'app-list-units',
  imports: [NavComponent, Footer, CommonModule, CreateUnit,EditUnit],
  templateUrl: './list-units.html',
  styleUrl: './list-units.css',
})
export class ListUnits implements OnInit {
  unidades: Unit[] = [];
  loading = true;
  error: string | null = null;
  showCreateModal = false;
  showEditModal = false;
  selectedUnitId: number | null = null;
  private apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUnidades();
  }

  loadUnidades(): void {
    this.loading = true;
    this.error = null;
    this.http.get<any>(`${this.apiUrl}/admin/units`).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.unidades = response.data;
        } else {
          this.error = response.message || 'Error al cargar unidades';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error de conexión al servidor';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  editarUnidad(id: number): void {
    this.abrirEditModal(id);
  }

  abrirCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onUnitCreated(): void {
    this.showCreateModal = false;
    this.loadUnidades(); // Recargar la lista
  }

  abrirEditModal(id: number): void {
    this.selectedUnitId = id;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUnitId = null;
  }

  onUnitUpdated(): void {
    this.showEditModal = false;
    this.selectedUnitId = null;
    this.loadUnidades(); // Recargar la lista
  }

  eliminarUnidad(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta unidad?')) {
      this.http.delete<any>(`${this.apiUrl}/admin/units/${id}`).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.unidades = this.unidades.filter((u) => u.id !== id);
            alert('Unidad eliminada correctamente');
            this.cdr.detectChanges();
          } else {
            alert('Error al eliminar la unidad: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error de conexión al eliminar la unidad');
        },
      });
    }
  }
}
