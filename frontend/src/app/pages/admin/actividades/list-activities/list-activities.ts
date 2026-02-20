import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { Archivo } from '../../../../archivo';

interface ActivityItem {
  id: number;
  user_name: string;
  department: string;
  code: string;
  state: string;
  created_at: string;
  updated_at: string;
  evidence_file: string;
}

@Component({
  selector: 'app-list-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer, RouterLink],
  templateUrl: './list-activities.html',
  styleUrl: './list-activities.css',
})
export class ListActivities implements OnInit {

  activities: ActivityItem[] = [];
  filtered: ActivityItem[] = [];
  pagedActivities: ActivityItem[] = [];

  searchTerm = '';
  dateFilter = '';

  loading = false;
  error = '';

  pageSize = 20;
  currentPage = 1;

  private readonly apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private archivo: Archivo
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  // ✅ CORREGIDO
  loadActivities(): void {

    this.loading = true;
    this.error = '';

    this.http.get<any>(`${this.apiUrl}/admin/activities`)
    .subscribe({

      next: (response) => {

        if (response.status === 'success' && response.data) {

          this.activities = response.data.map((item: any): ActivityItem => ({

            id: item?.id ?? 0,

            user_name: item?.user_name ?? '',

            department: item?.department ?? '',

            code: item?.code ?? '',

            state: item?.state ?? '',

            created_at: item?.created_at ?? '',

            updated_at: item?.updated_at ?? '',

            evidence_file:
              item?.evidence_file ??
              item?.document_name ??
              item?.document_url ??
              ''

          }));

          console.log('Activities cargadas:', this.activities);

          this.applyFilters();

        } else {

          this.error = response.message || 'No se pudieron cargar actividades';

        }

        this.loading = false;
        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error(err);

        this.error = 'Error de conexión al servidor';

        this.loading = false;

        this.cdr.detectChanges();

      }

    });

  }


  applyFilters(): void {

    const term = this.searchTerm.toLowerCase().trim();

    const date = this.dateFilter.trim();

    this.filtered = this.activities.filter(a => {

      const matchesTerm =

        !term ||

        a.user_name.toLowerCase().includes(term) ||

        a.department.toLowerCase().includes(term) ||

        a.code.toLowerCase().includes(term) ||

        a.state.toLowerCase().includes(term);


      const createdDate = a.created_at.slice(0,10);

      const matchesDate = !date || createdDate === date;

      return matchesTerm && matchesDate;

    });

    this.currentPage = 1;

    this.updatePagedActivities();

  }


  private updatePagedActivities(): void {

    const start = (this.currentPage - 1) * this.pageSize;

    const end = start + this.pageSize;

    this.pagedActivities = this.filtered.slice(start, end);

  }


  descargar(id: number, nombre: string): void {

    if (!nombre) nombre = 'archivo';

    console.log('Descargando:', id, nombre);

    this.archivo.descargarArchivo(id)

    .subscribe({

      next: (blob: Blob) => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.href = url;

        a.download = nombre;

        a.click();

        window.URL.revokeObjectURL(url);

      },

      error: () => {

        alert('Error al descargar archivo');

      }

    });

  }

}