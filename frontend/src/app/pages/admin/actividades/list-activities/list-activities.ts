import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';

interface ActivityItem {
  id: number;
  user_name: string | null;
  department: string | null;
  code: string | null;
  state: string | null;
  created_at: string | null;
  updated_at: string | null;
}

@Component({
  selector: 'app-list-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './list-activities.html',
  styleUrl: './list-activities.css',
})
export class ListActivities implements OnInit {
  activities: ActivityItem[] = [];
  filtered: ActivityItem[] = [];
  searchTerm = '';
  dateFilter = '';
  loading = false;
  error = '';
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${this.apiUrl}/admin/activities`).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.activities = response.data;
          this.applyFilters();
        } else {
          this.error = response.message || 'No se pudieron cargar actividades';
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

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const date = this.dateFilter.trim();

    this.filtered = this.activities.filter((a) => {
      const matchesTerm =
        !term ||
        (a.user_name || '').toLowerCase().includes(term) ||
        (a.department || '').toLowerCase().includes(term) ||
        (a.code || '').toLowerCase().includes(term) ||
        (a.state || '').toLowerCase().includes(term);

      const createdDate = (a.created_at || '').slice(0, 10);
      const matchesDate = !date || createdDate === date;

      return matchesTerm && matchesDate;
    });
  }

  formatMonthYear(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return `${months[date.getMonth()]} - ${date.getFullYear()}`;
  }

  formatRelativeUpdate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';

    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'hoy';
    if (diffDays === 1) return 'hace 1 dia';
    return `hace ${diffDays} dias`;
  }

  getStateClass(state: string | null): string {
    if (!state) return 'state-badge';
    const normalized = state
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
    return `state-badge state-${normalized}`;
  }
}