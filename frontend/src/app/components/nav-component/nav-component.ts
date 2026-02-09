import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-component',
  imports: [CommonModule],
  templateUrl: './nav-component.html',
  styleUrl: './nav-component.css',
})
export class NavComponent {
  activeLink = 0;
  dropdownOpen = false;

  setActiveLink(index: number): void {
    this.activeLink = index;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}
