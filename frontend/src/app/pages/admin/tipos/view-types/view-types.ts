import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { CreateType } from '../create-type/create-type';
import { EditType } from '../edit-type/edit-type';

interface Type {
  id: number;
  name: string;
  code_id: number;
  activities_count: number;
  created_at: string;
  updated_at: string;
}

interface Code {
  id: number;
  code: string;
  name: string;
}

@Component({
  selector: 'app-view-types',
  standalone: true,
  imports: [CommonModule, NavComponent, Footer, CreateType, EditType],
  templateUrl: './view-types.html',
  styleUrl: './view-types.css',
})
export class ViewTypes implements OnInit {
  types: Type[] = [];
  code: Code | null = null;
  loading = false;
  error = '';
  codeId: number | null = null;
  isCreateTypeOpen = false;
  isEditTypeOpen = false;
  selectedType: Type | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.codeId = +params['id'];
      if (this.codeId) {
        this.loadTypes();
      }
    });
  }

  loadTypes(): void {
    if (!this.codeId) return;

    this.loading = true;
    this.error = '';
    this.types = [];

    this.http.get<any>(`http://localhost:8000/admin/codes/${this.codeId}/types`).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.code = response.data.code;
          this.types = (response.data.types || []).sort((a: Type, b: Type) => a.name.localeCompare(b.name));
        } else {
          this.error = 'No se pudieron cargar los tipos';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error al cargar los tipos';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  crearTipo(): void {
    this.isCreateTypeOpen = true;
  }

  closeCreateTypeModal(): void {
    this.isCreateTypeOpen = false;
  }

  onTypeCreated(newType: Type): void {
    this.types.push(newType);
    this.types.sort((a, b) => a.name.localeCompare(b.name));
    this.cdr.detectChanges();
  }

  editarTipo(tipo: Type): void {
    this.selectedType = tipo;
    this.isEditTypeOpen = true;
  }

  closeEditTypeModal(): void {
    this.isEditTypeOpen = false;
    this.selectedType = null;
  }

  onTypeUpdated(updatedType: Type): void {
    const index = this.types.findIndex((t) => t.id === updatedType.id);
    if (index !== -1) {
      this.types[index] = updatedType;
      this.types.sort((a, b) => a.name.localeCompare(b.name));
      this.cdr.detectChanges();
    }
  }

  eliminarTipo(typeId: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este tipo?')) {
      return;
    }

    this.http.delete<any>(`http://localhost:8000/admin/types/${typeId}`).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.types = this.types.filter(t => t.id !== typeId);
          this.cdr.detectChanges();
        } else {
          alert(response.message || 'Error al eliminar el tipo');
        }
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error de conexión al eliminar el tipo');
      }
    });
  }
}
