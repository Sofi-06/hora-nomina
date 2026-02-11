import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
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
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}/auth/`, { email, password })
        .subscribe({
          next: (response) => {
            if (response.status === 'success' && response.usuario) {
              // Guardar usuario en localStorage y en el BehaviorSubject (solo en browser)
              if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('usuario', JSON.stringify(response.usuario));
              }
              this.usuarioActual.next(response.usuario);
              
              // Redirigir según el rol
              this.redirigirPorRol(response.usuario.role);
            }
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
    });
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

  private redirigirPorRol(rol: string): void {
    switch (rol.toLowerCase()) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'docente':
        this.router.navigate(['/docente']);
        break;
      case 'estudiante':
        this.router.navigate(['/estudiante']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
}
