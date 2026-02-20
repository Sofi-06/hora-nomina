import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-extend-date',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './extend-date.html',
  styleUrl: './extend-date.css',
})
export class ExtendDate {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  days = 0;

  close(): void {
    this.closeModal.emit();
  }

  accept(): void {
    // Por ahora solo cierra (sin funcionalidad)
    this.close();
  }
}
