import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-type.html',
  styleUrl: './edit-type.css',
})
export class EditType implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() codeId!: number;
  @Input() codeName: string = '';
  @Input() typeId!: number;
  @Input() typeName: string = '';
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() typeUpdated = new EventEmitter<any>();
  
  nombre: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  constructor(private readonly http: HttpClient) {}
  
  ngOnInit(): void {
    this.nombre = this.typeName;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.nombre = this.typeName;
      this.errorMessage = '';
    }
  }
  
  actualizar(): void {
    if (!this.nombre || this.nombre.trim() === '') {
      this.errorMessage = 'El nombre del tipo es requerido';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const payload = {
      name: this.nombre.trim()
    };
    
    this.http.put(`http://localhost:8000/admin/types/${this.typeId}`, payload).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.typeUpdated.emit(response.type);
          this.closeModal.emit();
          this.isOpen = false;
        } else {
          this.errorMessage = response.message || 'Error al actualizar';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMessage = error.error?.message || 'Error al actualizar el tipo';
        this.isLoading = false;
      }
    });
  }
  
  close(): void {
    this.closeModal.emit();
    this.isOpen = false;
    this.nombre = '';
    this.errorMessage = '';
  }
}
