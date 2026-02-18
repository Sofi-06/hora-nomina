import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { RouterLink } from '@angular/router';

interface CodeItem {
  id: number;
  code: string;
  name: string;
  unit: string | null;
  types: number;
}

@Component({
  selector: 'app-list-codes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer, RouterLink],
  templateUrl: './list-codes.html',
  styleUrl: './list-codes.css',
})
export class ListCodes implements OnInit {
  codes: CodeItem[] = [];
  codesFiltered: CodeItem[] = [];
  searchTerm: string = '';
  loading = false;
  error = '';
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCodes();
  }

  loadCodes(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${this.apiUrl}/admin/codes`).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.codes = response.data;
          if (this.searchTerm.trim()) {
            this.buscar();
          } else {
            this.codesFiltered = this.codes;
          }
        } else {
          this.error = response.message || 'No se pudieron cargar los codigos';
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
      this.codesFiltered = this.codes;
      return;
    }

    this.codesFiltered = this.codes.filter((c) =>
      c.code.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      (c.unit || '').toLowerCase().includes(term)
    );
  }

  eliminarCodigo(id: number): void {
    if (!confirm('Estas seguro de que deseas eliminar este codigo?')) {
      return;
    }

    this.http.delete<any>(`${this.apiUrl}/admin/codes/${id}`).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.codes = this.codes.filter((c) => c.id !== id);
          this.codesFiltered = this.codesFiltered.filter((c) => c.id !== id);
          this.cdr.detectChanges();
        } else {
          alert(response.message || 'Error al eliminar el codigo');
        }
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error de conexion al eliminar el codigo');
      },
    });
  }
}