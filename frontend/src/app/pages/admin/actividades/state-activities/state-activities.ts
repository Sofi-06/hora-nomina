import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { Archivo } from '../../../../archivo';

@Component({
  selector: 'app-state-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './state-activities.html',
  styleUrls: ['./state-activities.css'],
})
export class StateActivities implements OnInit {
  private apiUrl = 'http://localhost:8000';

  activityId!: number;
  loading = false;
  saving = false;
  visualizing = false;
  error = '';

  activity: any = {
  id: 0,
  user_name: '',
  code: '',
  dedicated_hours: '',
  description: '',
  document_name: '',
  document_url: '',
  month: '',
  created_at: '',
  state: '',
  observations: '',
};

  states: string[] = ['Aprobado', 'Revisión', 'Desaprobado', 'Reenviado', 'Con observaciones'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private archivo: Archivo
  ) {}

  ngOnInit(): void {
    this.activityId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadActivity();
  }

  loadActivity(): void {
    this.loading = true;
    this.error = '';

    this.http.get<any>(`${this.apiUrl}/admin/activities/${this.activityId}`).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
this.activity = {
  id: data?.id ?? 0,                          // <-- faltaba
  evidence_file: data?.evidence_file ?? '',   // <-- faltaba
  user_name: data?.user_name ?? '',
  code: data?.code ?? '',
  dedicated_hours: data?.dedicated_hours ?? '',
  description: data?.description ?? '',
  document_name: data?.document_name ?? data?.document_url ?? '',
  document_url: data?.document_url ?? '',
  month: data?.month ?? '',
  created_at: data?.created_at ?? '',
  state: data?.state ?? '',
  observations: data?.observations ?? '',
};
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar la actividad.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  saveState(): void {
    if (!this.activity.state || this.saving) return;

    this.saving = true;
    this.error = '';

    this.http
      .put(`${this.apiUrl}/admin/activities/${this.activityId}/state`, {
        state: this.activity.state,
        observations: this.activity.observations || '',
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/actividades']);
        },
        error: () => {
          this.error = 'No se pudo actualizar el estado.';
          this.saving = false;
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/actividades']);
  }

  formatDateTime(value: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const day = date.getDate();
    const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    return `${weekday} ${day} de ${month} de ${year} ${time}`;
  }

  //-------------------------------------------------------

  visualizar(): void {
    if (this.visualizing) return;

    const id = this.activity.id;
    const nombre = this.activity.evidence_file || this.activity.document_name || '';

    if (!id) {
      alert('ID de actividad no válido');
      return;
    }

    // Verificar extensión antes de hacer la petición
    const ext = (nombre || '').toLowerCase().split('.').pop() || '';
    if (!['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
      alert(`Los archivos .${ext} no se pueden visualizar en el navegador.\nPor favor, use el botón "Descargar".`);
      return;
    }

    this.visualizing = true;

    this.archivo.visualizarArchivo(id).subscribe({
      next: (blob: Blob) => {
        const mime = blob.type || this.getMimeTypeFromName(nombre);
        const blobFinal = mime && blob.type !== mime 
          ? new Blob([blob], { type: mime }) 
          : blob;

        const url = window.URL.createObjectURL(blobFinal);
        window.open(url, '_blank', 'noopener,noreferrer');

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          this.visualizing = false;
        }, 1000);
      },
      error: () => {
        alert('Error al visualizar archivo');
        this.visualizing = false;
      }
    });
  }

  private getMimeTypeFromName(nombre: string): string {
    const ext = (nombre || '').toLowerCase().split('.').pop() || '';
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml'
    };
    return map[ext] || 'application/octet-stream';
  }

  descargar(id: number, nombre: string): void {
    console.log('ID a descargar:', id, typeof id);

    this.archivo.descargarArchivo(id).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombre;  
      console.log('Nombre archivo:', nombre);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
