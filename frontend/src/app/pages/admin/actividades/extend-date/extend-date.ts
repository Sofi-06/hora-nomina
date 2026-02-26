import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-extend-date',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './extend-date.html',
  styleUrl: './extend-date.css',
})
export class ExtendDate implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() deadline: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 10, 23, 59, 59);
  @Output() closeModal = new EventEmitter<void>();

  days = 0;
  countdown = '';
  intervalId: any;

  ngOnInit(): void {
    this.autoResetDeadlineIfNeeded();
    this.updateCountdown();
    this.intervalId = setInterval(() => {
      this.autoResetDeadlineIfNeeded();
      this.updateCountdown();
    }, 60000);
  }

  autoResetDeadlineIfNeeded(): void {
    // Si el mes cambió respecto al deadline guardado, resetear al 10 del mes actual
    const now = new Date();
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('extendedDeadline');
      if (stored) {
        const storedDate = new Date(stored);
        if (storedDate.getMonth() !== now.getMonth() || storedDate.getFullYear() !== now.getFullYear()) {
          // Resetear deadline
          const reset = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59);
          localStorage.setItem('extendedDeadline', reset.toISOString());
          this.deadline = reset;
          this.days = 0;
        } else {
          this.deadline = storedDate;
        }
      } else {
        this.deadline = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59);
      }
    } else {
      // SSR: fallback, just use default deadline
      this.deadline = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  updateCountdown(): void {
    const now = new Date();
    let end = new Date(this.deadline);
    // La cuenta regresiva SIEMPRE se basa en el deadline actual guardado, no en el input de días
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) {
      this.countdown = 'Plazo finalizado';
      return;
    }
    let diffDays = Math.floor(diffMs / 86400000);
    let diffHours = Math.floor((diffMs % 86400000) / 3600000);
    let diffMins = Math.floor((diffMs % 3600000) / 60000);
    if (
      end.getFullYear() === now.getFullYear() &&
      end.getMonth() === now.getMonth() &&
      end.getDate() === now.getDate()
    ) {
      diffDays = 0;
    }
    this.countdown = `${diffDays} días, ${diffHours} horas, ${diffMins} minutos`;
  }

  close(): void {
    this.closeModal.emit();
  }

  accept(): void {
    // Guardar nueva fecha límite extendida en localStorage
    let newDeadline = new Date(this.deadline);
    if (this.days > 0) {
      newDeadline.setDate(newDeadline.getDate() + this.days);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('extendedDeadline', newDeadline.toISOString());
    }
    this.deadline = newDeadline;
    this.updateCountdown();
    this.close();
  }

    resetToDefault(): void {
    // Restablece el plazo a los primeros 10 días del mes actual
    this.days = 0;
    this.deadline = new Date(new Date().getFullYear(), new Date().getMonth(), 10, 23, 59, 59);
    localStorage.setItem('extendedDeadline', this.deadline.toISOString());
    this.updateCountdown();
  }
}
