import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { RouterLink } from '@angular/router';

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
  pageSize: number = 20;
  currentPage: number = 1;
  private readonly apiUrl = 'http://localhost:8000';

  constructor(private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {}

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
          this.cdr.detectChanges();

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

    this.currentPage = 1;
    this.updatePagedActivities();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pageStart(): number {
    return this.filtered.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filtered.length);
  }

  goToPage(page: number): void {
    const safePage = Math.min(Math.max(page, 1), this.totalPages);
    if (safePage === this.currentPage) {
      return;
    }
    this.currentPage = safePage;
    this.updatePagedActivities();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  private updatePagedActivities(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedActivities = this.filtered.slice(startIndex, endIndex);
  }

  formatMonthYear(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return `${months[date.getMonth()]} - ${date.getFullYear()}`;
  }

  formatRelativeUpdate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';

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
      .replaceAll(/[\u0300-\u036f]/g, '')
      .replaceAll(/\s+/g, '-');
    return `state-badge state-${normalized}`;
  }
}