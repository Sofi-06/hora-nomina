import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Footer } from '../../components/footer/footer';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, NavComponent, Footer, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  private readonly apiUrl = 'http://localhost:8000';
  private readonly http: HttpClient;
  private readonly cdr: ChangeDetectorRef;
  private readonly router: Router;


  useDateStart = false;
  useDateEnd = false;
  useState = false;
  useDepartment = false;
  useUnit = false;

  startDate = '';
  endDate = '';
  selectedState = '';
  selectedDepartment = '';
  selectedUnit = '';

  stateOptions: Array<{ id?: number; name: string }> = [];
  departmentOptions: Array<{ id: number; name: string }> = [];
  unitOptions: Array<{ id: number; name: string }> = [];

  loading = false;
  error = '';

  constructor(http: HttpClient, cdr: ChangeDetectorRef, router: Router) {
    this.http = http;
    this.cdr = cdr;
    this.router = router;
  }

  ngOnInit(): void {
    this.loadFilterOptions();
  }

  private async loadFilterOptions(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const departments$ = this.http.get<any>(`${this.apiUrl}/admin/departments`);
      const units$ = this.http.get<any>(`${this.apiUrl}/admin/units`);
      const states$ = this.http.get<any>(`${this.apiUrl}/admin/activity-states`);

      const [deptsResponse, unitsResponse, statesResponse] = await Promise.all([
        firstValueFrom(departments$),
        firstValueFrom(units$),
        firstValueFrom(states$)
      ]);

      if (deptsResponse?.status === 'success' && Array.isArray(deptsResponse.data)) {
        this.departmentOptions = deptsResponse.data;
      }

      if (unitsResponse?.status === 'success' && Array.isArray(unitsResponse.data)) {
        this.unitOptions = unitsResponse.data;
      }


      if (statesResponse?.status === 'success' && Array.isArray(statesResponse.data)) {
        this.stateOptions = statesResponse.data;
      }

      this.loading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error cargando opciones:', err);
      this.error = 'Error cargando opciones de filtro';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  clearFilters(): void {
    this.useDateStart = false;
    this.useDateEnd = false;
    this.useState = false;
    this.useDepartment = false;
    this.useUnit = false;

    this.startDate = '';
    this.endDate = '';
    this.selectedState = '';
    this.selectedDepartment = '';
    this.selectedUnit = '';
  }

  previsualizarReporte(): void {
    const filters = this.getSelectedFilters();
    this.router.navigate(['/verReportes'], { queryParams: filters });
  }

  generarReporte(): void {
    const filters = this.getSelectedFilters();
    this.router.navigate(['/verReportes'], { queryParams: filters });
  }

  hasAnyFilterEnabled(): boolean {
    return this.useDateStart || this.useDateEnd || this.useState || this.useDepartment || this.useUnit;
  }

  private getSelectedFilters(): Record<string, string> {
    const filters: Record<string, string> = {};

    if (this.useDateStart && this.startDate) filters['fecha_inicio'] = this.startDate;
    if (this.useDateEnd && this.endDate) filters['fecha_final'] = this.endDate;
    if (this.useState && this.selectedState) filters['estado'] = this.selectedState;
    if (this.useDepartment && this.selectedDepartment) filters['departamento'] = this.selectedDepartment;
    if (this.useUnit && this.selectedUnit) filters['unidad'] = this.selectedUnit;

    return filters;
  }

}

