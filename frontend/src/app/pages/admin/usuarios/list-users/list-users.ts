import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NavComponent   } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';
import { ChangeDetectorRef } from '@angular/core';
import { Router,  RouterLink } from '@angular/router';


interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  units: string | null;
  activities: number;
  state: string;
  created_at: string;
}

@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer, RouterLink],
  templateUrl: './list-users.html',
  styleUrl: './list-users.css',
})
export class ListUsers implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  usuariosFiltered: Usuario[] = [];
  pagedUsuarios: Usuario[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';
  pageSize: number = 20;
  currentPage: number = 1;
  private apiUrl = 'http://localhost:8000';
  private subscription?: Subscription;

  constructor(private http: HttpClient, private cd: ChangeDetectorRef, private router: Router)  {}

  ngOnInit() {
    this.loadUsuarios();
  }

    loadUsuarios(options?: { preserveSearch?: boolean; clearSuccessMessage?: boolean }): void {
    const preserveSearch = options?.preserveSearch ?? false;
    const clearSuccessMessage = options?.clearSuccessMessage ?? true;
    this.error = '';
    if (clearSuccessMessage) {
      this.successMessage = '';
    }
    
    this.http.get<any>(`${this.apiUrl}/admin/users`)
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.usuarios = response.data;

            if (preserveSearch) {
              this.buscar();
            } else {
              this.usuariosFiltered = this.usuarios;
              this.currentPage = 1;
              this.updatePagedUsuarios();
              this.cd.detectChanges();
            }

            console.log('Usuarios cargados:', this.usuarios);
          } else {
            this.error = response.message || 'No se pudieron cargar los usuarios';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error cargando usuarios:', error);
          this.error = 'Error al conectar con el servidor';
          this.loading = false;
        }
      });
  }

  buscar(): void {
    if (!this.searchTerm.trim()) {
      this.usuariosFiltered = this.usuarios;
      this.currentPage = 1;
      this.updatePagedUsuarios();
      return;
    }
    this.usuariosFiltered = this.usuarios.filter(u =>
      u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
    this.updatePagedUsuarios();
  }

activarUsuario(id: number): void {
  this.http.put<any>(`${this.apiUrl}/admin/users/${id}/activate`, {})
    .subscribe({
      next: (response) => {
        if (response.status === 'success') {

          const usuario = this.usuarios.find(u => u.id === id);
          if (usuario) {
            usuario.state = 'Activo';
          }

          this.successMessage = 'Usuario activado correctamente';
          this.cd.detectChanges();

          setTimeout(() => {
            this.successMessage = '';
            this.cd.detectChanges(); 
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Error activando usuario:', error);
        this.error = 'Error al activar el usuario';
        this.cd.detectChanges();
      }
    });
}


  inactivarUsuario(id: number): void {
    this.http.put<any>(`${this.apiUrl}/admin/users/${id}/deactivate`, {})
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            const usuario = this.usuarios.find(u => u.id === id);
            if (usuario) {
              usuario.state = 'Inactivo';
              this.cd.detectChanges();
            }
            
          this.error = 'Usuario inactivado correctamente';
          this.cd.detectChanges();
          setTimeout(() => {
            this.error = '';
            this.cd.detectChanges(); 
          }, 2000);
          }
        },
        error: (error) => {
          console.error('Error inactivando usuario:', error);
          this.error = 'Error al inactivar el usuario';
        }
      });
  }

editarUsuario(id: number): void {
  this.router.navigate(['/editarUsuarios', id]);
}


eliminarUsuario(id: number): void {
  if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

  this.http.delete<any>(`${this.apiUrl}/admin/users/${id}`)
    .subscribe({
      next: (response) => {

        if (response.status === 'success') {
          this.usuarios = this.usuarios.filter(u => u.id !== id);
          this.usuariosFiltered = this.usuariosFiltered.filter(u => u.id !== id);
          this.updatePagedUsuarios();
          this.successMessage = 'Usuario eliminado correctamente';
          this.cd.detectChanges();
          
          setTimeout(() => {
            this.successMessage = '';
            this.cd.detectChanges();
          }, 3000);
        }
      },
      error: (error) => {
        this.error = 'Error al eliminar el usuario';
        this.cd.markForCheck();
      }
    });
}



  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltered.length / this.pageSize));
  }

  get pageStart(): number {
    return this.usuariosFiltered.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.usuariosFiltered.length);
  }

  goToPage(page: number): void {
    const safePage = Math.min(Math.max(page, 1), this.totalPages);
    if (safePage === this.currentPage) {
      return;
    }
    this.currentPage = safePage;
    this.updatePagedUsuarios();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  private updatePagedUsuarios(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedUsuarios = this.usuariosFiltered.slice(startIndex, endIndex);
  }
}