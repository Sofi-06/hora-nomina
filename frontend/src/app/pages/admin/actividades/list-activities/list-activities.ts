import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { Archivo } from '../../../../archivo';
import { ExtendDate } from '../extend-date/extend-date';
import { Auth, Usuario } from '../../../../services/auth';

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
  imports: [CommonModule, FormsModule, NavComponent, Footer, RouterLink, ExtendDate],
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

  showExtendModal = false;
  deadline: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 10, 23, 59, 59);

  usuario: Usuario | null = null;
  role: string = '';
  descargandoId: number | null = null;

  private readonly apiUrl = 'http://localhost:8000';

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly archivo: Archivo,
    private readonly auth: Auth
  ) {
    this.usuario = this.auth.getUsuarioActual();
    this.role = this.usuario?.role?.toLowerCase() ?? '';
  }

  ngOnInit(): void {
    this.loadActivities();
  }

  // ✅ CORREGIDO
 loadActivities(): void {
  this.loading = true;
  this.error = '';


  const user_id = this.usuario?.id;
  const role = this.usuario?.role?.toLowerCase();

  if (!user_id || !role) {
    this.error = 'No hay usuario autenticado';
    this.loading = false;
    return;
  }

  this.http.get<any>(`http://localhost:8000/director/activities?user_id=${user_id}&role=${role}`)
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
            evidence_file: item?.evidence_file ?? item?.document_name ?? item?.document_url ?? ''
          }));
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



  openExtendModal(): void {
    // Cargar deadline extendido si existe
    const stored = localStorage.getItem('extendedDeadline');
    if (stored) {
      this.deadline = new Date(stored);
    } else {
      this.deadline = new Date(new Date().getFullYear(), new Date().getMonth(), 10, 23, 59, 59);
    }
    this.showExtendModal = true;
  }

  closeExtendModal(): void {
    this.showExtendModal = false;
  }


  private updatePagedActivities(): void {

    const start = (this.currentPage - 1) * this.pageSize;

    const end = start + this.pageSize;

    this.pagedActivities = this.filtered.slice(start, end);

  }


  descargar(id: number, nombre: string): void {
    if (!nombre) nombre = 'archivo';
    this.descargandoId = id;
    this.archivo.descargarArchivo(id)
      .subscribe({
        next: (blob: Blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = nombre;
          a.click();
          globalThis.URL.revokeObjectURL(url);
          this.descargandoId = null;
          this.cdr.detectChanges();
        },
        error: () => {
          alert('Error al descargar archivo');
          this.descargandoId = null;
          this.cdr.detectChanges();
        }
      });
  }


  get totalPages(): number {
    const total = this.filtered.length;
    if (!total) return 1;
    const size = this.pageSize;
    return Math.max(1, Math.ceil(total / size));
  }

  get pageStart(): number {
    const total = this.filtered.length;
    if (!total) return 0;
    const size = this.pageSize;
    return (this.currentPage - 1) * size + 1;
  }

  get pageEnd(): number {
    const size = this.pageSize;
    return Math.min(this.currentPage * size, this.filtered.length);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedActivities();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedActivities();
    }
  }

  getStateClass(state: string): string {
    const stateMap: { [key: string]: string } = {
      'Aprobado': 'state-green',
      'Reenviado': 'state-yellow',
      'Con observaciones': 'state-yellow',
      'Desaprobado': 'state-red',
      'Revisión': 'state-orange',
      'Pendiente': 'state-default',
      'Aprobada': 'state-green',
      'Rechazada': 'state-red',
      'En revisión': 'state-orange'
    };
    return stateMap[state] || 'state-default';
  }

  formatMonthYear(value?: string | Date | null): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  formatRelativeUpdate(value?: string | Date | null): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';

    const diffMs = Date.now() - d.getTime();
    const min = Math.floor(diffMs / 60000);
    const h = Math.floor(min / 60);
    const day = Math.floor(h / 24);

    if (min < 1) return 'Justo ahora';
    if (min < 60) return `Hace ${min} min`;
    if (h < 24) return `Hace ${h} h`;
    if (day < 30) return `Hace ${day} d`;

    return d.toLocaleDateString('es-ES');
  }

}