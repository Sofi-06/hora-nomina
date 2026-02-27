import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Footer } from '../../components/footer/footer';
import { Auth } from '../../services/auth';

interface ActivityItem {
  id: number;
  user_name: string;
  department: string;
  unit: string;
  code: string;
  state: string;
  month: string;
  created_at: string;
  updated_at: string;
  evidence_file: string;
  observations?: string | null;
}

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer, RouterLink],
  templateUrl: './docente.html',
  styleUrl: './docente.css'
})
export class Docente implements OnInit {
  creationBlocked = false;

  nombreUsuario: string = '';
  currentDate: string = '';

  // Actividades
  activities: ActivityItem[] = [];
  filtered: ActivityItem[] = [];
  pagedActivities: ActivityItem[] = [];

  searchTerm = '';
  dateFilter = '';

  loading = false;
  error = '';

  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pageStart = 1;
  pageEnd = 1;

  private readonly apiUrl = 'http://localhost:8000';

  constructor(
    private readonly auth: Auth,
    private readonly http: HttpClient,
    private readonly cd: ChangeDetectorRef,
    private readonly router: Router
  ) { }

  ngOnInit() {
    this.creationBlocked = this.isCreationBlockedByDeadline();
    setInterval(() => {
      const blocked = this.isCreationBlockedByDeadline();
      if (blocked !== this.creationBlocked) {
        this.creationBlocked = blocked;
        this.cd.detectChanges();
      }
    }, 60000);
    const usuario = this.auth.getUsuarioActual();
    this.nombreUsuario = usuario?.name || 'Docente';
    this.setCurrentDate();
    this.loadActivities();
  }

  isCreationBlockedByDeadline(): boolean {
    // Usa deadline extendido si existe y solo resetea si es de un mes anterior
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    let deadline: Date;
    const stored = localStorage.getItem('extendedDeadline');

    if (stored) {
      const storedDate = new Date(stored);
      // Si la fecha guardada es de un mes pasado (anterior al 1ero de este mes), resetear
      if (storedDate < currentMonthStart) {
        deadline = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59);
        localStorage.setItem('extendedDeadline', deadline.toISOString());
      } else {
        deadline = storedDate;
      }
    } else {
      deadline = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59);
    }
    return now > deadline;
  }

  private setCurrentDate(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    this.currentDate = now.toLocaleDateString('es-ES', options)
      .split(',')
      .map(part => part.trim())
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(', ');
  }


  // Modal de observación
  modalObservationVisible = false;
  modalObservationText = '';

  showObservation(activity: ActivityItem): void {
    this.modalObservationText = activity.observations || '';
    this.modalObservationVisible = true;
    this.cd.detectChanges();
  }

  closeObservationModal(): void {
    this.modalObservationVisible = false;
    this.modalObservationText = '';
    this.cd.detectChanges();
  }


  loadActivities(): void {
    this.loading = true;
    this.error = '';

    const usuario = this.auth.getUsuarioActual();
    const userId = usuario?.id;

    if (!userId) {
      this.error = 'No se pudo obtener el ID del usuario';
      this.loading = false;
      this.cd.detectChanges();
      return;
    }

    this.http.get<any>(`${this.apiUrl}/docente/activities?user_id=${userId}`)
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.activities = response.data.map((item: any): ActivityItem => ({
              id: item?.id ?? 0,
              user_name: item?.user_name ?? '',
              department: item?.department ?? '',
              unit: item?.unit ?? '',
              code: item?.code ?? '',
              state: item?.state ?? '',
              month: item?.month ? item.month : '-',
              created_at: item?.created_at ?? '',
              updated_at: item?.updated_at ?? '',
              evidence_file: item?.evidence_file ?? item?.document_name ?? item?.document_url ?? '',
              observations: item?.observations ?? null
            }));

            console.log('Actividades del docente cargadas:', this.activities);
            this.applyFilters();
            this.loading = false;
            this.cd.detectChanges();
          }
        },
        error: (error) => {
          console.error('❌ Error cargando actividades:', error);
          this.error = 'No se pudieron cargar las actividades';
          this.loading = false;
          this.cd.detectChanges();
        }
      });
  }

  applyFilters(): void {
    this.filtered = this.activities.filter(activity => {
      const searchTerm = this.searchTerm ?? '';
      const dateFilter = this.dateFilter ?? '';
      const code = activity.code ?? '';
      const user_name = activity.user_name ?? '';
      const state = activity.state ?? '';
      const created_at = activity.created_at ?? '';

      const matchesSearch = !searchTerm ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        state.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !dateFilter ||
        created_at.startsWith(dateFilter);

      return matchesSearch && matchesDate;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filtered.length / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filtered.length);

    this.pagedActivities = this.filtered.slice(startIndex, endIndex);

    this.pageStart = startIndex + 1;
    this.pageEnd = endIndex;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  formatMonthYear(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    // Restar un mes
    let prevMonth = d.getMonth() - 1;
    let year = d.getFullYear();
    if (prevMonth < 0) {
      prevMonth = 11;
      year = year - 1;
    }
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[prevMonth] + ' ' + year;
  }

  formatRelativeUpdate(date: string): string {
    if (!date) return '-';

    const now = new Date();
    const updated = new Date(date);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace poco';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;

    return `${updated.getDate()}/${updated.getMonth() + 1}/${updated.getFullYear()}`;
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

  descargar(id: number, archivo: string): void {
    if (!archivo) {
      alert('No hay archivo disponible');
      return;
    }

    const link = document.createElement('a');
    link.href = `${this.apiUrl}/descargar/${id}`;
    link.download = archivo;
    link.click();
  }

  openCreateActivity(): void {
    this.router.navigate(['/crear-actividad']);
  }

  editar(id: number): void {
    this.router.navigate([`/editarActividad/${id}`]);
  }

  eliminar(id: number): void {

    if (confirm('¿Seguro que deseas eliminar esta actividad?')) {

      this.http.delete(`${this.apiUrl}/docente/activities/${id}`).subscribe({
        next: () => {
          this.activities = this.activities.filter(a => a.id !== id);
          this.applyFilters();
          this.cd.detectChanges();
        },
        error: () => {
          alert('Error al eliminar la actividad');
        }
      });
    }
  }
}