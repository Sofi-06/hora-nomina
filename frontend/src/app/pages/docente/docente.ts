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
}

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer, RouterLink],
  templateUrl: './docente.html',
  styleUrl: './docente.css'
})
export class Docente implements OnInit {
  
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
    private auth: Auth,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    const usuario = this.auth.getUsuarioActual();
    this.nombreUsuario = usuario?.name || 'Docente';
    this.setCurrentDate();
    this.loadActivities();
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
              evidence_file: item?.evidence_file ?? item?.document_name ?? item?.document_url ?? ''
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
      const matchesSearch = !this.searchTerm || 
        activity.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        activity.user_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        activity.state.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesDate = !this.dateFilter || 
        activity.created_at.startsWith(this.dateFilter);

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
    // Lógica para eliminar actividad
    // Por ejemplo, mostrar confirmación y luego eliminar
    if (confirm('¿Seguro que deseas eliminar esta actividad?')) {
      // Aquí puedes llamar al backend para eliminar
      // Ejemplo:
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