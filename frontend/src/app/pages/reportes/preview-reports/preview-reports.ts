import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NavComponent } from '../../../components/nav-component/nav-component';
import { Footer } from '../../../components/footer/footer';

interface Activity {
  id: number;
  evidence_file: string;
  user_name: string;
  department: string;
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

  activities: Activity[] = [];
  loading = false;
  error = '';

  constructor(http: HttpClient, cdr: ChangeDetectorRef, route: ActivatedRoute) {
    this.http = http;
    this.cdr = cdr;
    this.route = route;
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
      
      // Build query string from parameters
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');

      const finalUrl = queryString 
        ? `${this.apiUrl}/admin/activities?${queryString}`
        : `${this.apiUrl}/admin/activities`;

      const response = await firstValueFrom(this.http.get<{ status: string; data: Activity[] }>(finalUrl));

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
    // TODO: Implement Excel download functionality
    console.log('Descargar Excel con datos filtrados');
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
