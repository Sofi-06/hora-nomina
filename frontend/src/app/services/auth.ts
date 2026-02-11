import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timeout, catchError, TimeoutError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


export interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  status: string;
  mensaje: string;
  usuario?: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:8000';
  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  
  public usuario$ = this.usuarioActual.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar si hay sesión guardada (solo en el browser)
    if (isPlatformBrowser(this.platformId)) {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        this.usuarioActual.next(JSON.parse(usuarioGuardado));
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/auth/`, { email, password })
    .pipe(
      timeout(2000), // Timeout de solo 3 segundos
      catchError((error: any) => {
        console.error('Error en login:', error);
        
        if (error instanceof TimeoutError) {
          return throwError(() => ({ 
            status: 0, 
            message: 'Servidor no disponible. Verifique su conexión.',
            error: 'timeout'
          }));
        }
        
        return throwError(() => error);
      })
    );
}

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario');
    }
    this.usuarioActual.next(null);
    this.router.navigate(['/login']);
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioActual.value;
  }

  isAuthenticated(): boolean {
    return this.usuarioActual.value !== null;
  }

  getDashboardMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard-metrics`)
      .pipe(
        timeout(5000),
        catchError((error: any) => {
          console.error('Error obteniendo métricas:', error);
          return throwError(error);
        })
      );
  }

  private redirigirPorRol(rol: string): void {
    switch (rol.toLowerCase()) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'docente':
        this.router.navigate(['/docente']);
        break;
      case 'director':
        this.router.navigate(['/director']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
}
