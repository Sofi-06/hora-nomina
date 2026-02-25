import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Auth, Usuario } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NavComponent } from '../../../components/nav-component/nav-component';
import { Footer } from '../../../components/footer/footer';

interface Activity {
  id: number;
  evidence_file: string;
  user_name: string;
  department: string;
  unit?: string;
  code: string;
  state: string;
  description: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-preview-reports',
  imports: [CommonModule, NavComponent, Footer],
  templateUrl: './preview-reports.html',
  styleUrl: './preview-reports.css',
})
export class PreviewReports implements OnInit {
  public readonly apiUrl = 'http://localhost:8000';
  private readonly http: HttpClient;
  private readonly cdr: ChangeDetectorRef;
  private readonly route: ActivatedRoute;
  private readonly auth: Auth;

  activities: Activity[] = [];
  private currentFilters: Record<string, string> = {};
  loading = false;
  error = '';
  descargando = false;
  usuario: Usuario | null = null;
  role: string = '';
  userId: number | null = null;

  constructor(http: HttpClient, cdr: ChangeDetectorRef, route: ActivatedRoute, auth: Auth) {
    this.http = http;
    this.cdr = cdr;
    this.route = route;
    this.auth = auth;
    this.usuario = this.auth.getUsuarioActual();
    this.role = (this.usuario?.role || '').toLowerCase();
    this.userId = this.usuario?.id || null;
  }

  ngOnInit(): void {
    this.loadFilteredActivities();
  }

  private async loadFilteredActivities(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      // Get query parameters from route
      const queryParams = this.route.snapshot.queryParams;
      this.currentFilters = Object.entries(queryParams).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && String(value).trim() !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>);

      let url = `${this.apiUrl}/admin/activities`;
      let params: any = { ...this.currentFilters };
      if (this.role === 'director' && this.userId) {
        url = `${this.apiUrl}/director/activities`;
        params = { ...params, user_id: this.userId, role: 'director' };
      }

      const response = await firstValueFrom(this.http.get<{ status: string; data: Activity[] }>(url, { params }));

      if (response.status === 'success' && response.data) {
        this.activities = response.data;
      } else {
        this.error = 'No se pudieron cargar las actividades';
      }
    } catch (err: any) {
      console.error('Error cargando actividades filtradas:', err);
      this.error = 'Error al cargar los datos: ' + (err.message || 'Error desconocido');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  descargarExcel(): void {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(this.currentFilters)) {
      params = params.set(key, value);
    }
    let url = `${this.apiUrl}/admin/reports/excel`;
    if (this.role === 'director' && this.userId) {
      url = `${this.apiUrl}/director/reports/excel`;
      params = params.set('user_id', this.userId.toString());
    }
    this.descargando = true;
    this.http.get(url, {
      params,
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = globalThis.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = `reporte_actividades_${new Date().toISOString().slice(0, 10)}.xlsx`;
        anchor.click();
        globalThis.URL.revokeObjectURL(downloadUrl);
        this.descargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error descargando Excel:', err);
        this.error = 'No se pudo descargar el archivo Excel';
        this.descargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  getMonthName(dateString: string): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const date = new Date(dateString);
    return months[date.getMonth()];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
