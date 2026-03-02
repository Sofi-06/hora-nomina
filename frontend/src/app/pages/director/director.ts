import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav-component/nav-component';
import { Footer } from '../../components/footer/footer';
import { Auth, Usuario } from '../../services/auth';

@Component({
  selector: 'app-director',
  imports: [CommonModule, NavComponent, Footer],
  templateUrl: './director.html',
  styleUrls: ['./director.css']
})
export class Director implements OnInit {

  nombreUsuario: string = '';
  metrics: any = null;
  loading: boolean = true;
  error: string = '';
  currentDate: string = '';

  constructor(private auth: Auth, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    const usuario: Usuario | null = this.auth.getUsuarioActual();
    this.nombreUsuario = usuario?.name || '';
    this.setCurrentDate();
    if (usuario) {
      this.auth.getDirectorDashboardMetrics(usuario.id).subscribe({
        next: (resp) => {
          this.metrics = resp.data;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.error = 'No se pudieron cargar las métricas.';
          this.loading = false;
          this.cd.detectChanges();
        }
      });
    } else {
      this.error = 'No se encontró información de usuario.';
      this.loading = false;
      this.cd.detectChanges();
    }
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
}