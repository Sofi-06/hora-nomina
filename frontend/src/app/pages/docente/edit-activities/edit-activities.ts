import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavComponent } from '../../../components/nav-component/nav-component';
import { Footer } from '../../../components/footer/footer';
import { Auth } from '../../../services/auth';

interface Unit {
  id: number;
  name: string;
}

interface Code {
  id: number;
  code: string;
  name: string;
  unit_id: number;
}

interface ActivityType {
  id: number;
  name: string;
  code_id: number;
}

@Component({
  selector: 'app-edit-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, Footer],
  templateUrl: './edit-activities.html',
  styleUrl: './edit-activities.css',
})
export class EditActivities implements OnInit {
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  selectedUnit: number | null = null;
  selectedCode: number | null = null;
  selectedActivityType: number | null = null;
  dedicatedHours: number | null = null;
  description = '';
  selectedFile: File | null = null;

  units: Unit[] = [];
  codes: Code[] = [];
  activityTypes: ActivityType[] = [];

  currentMonth = '';
  private apiUrl = 'http://localhost:8000';
  private userId: number | null = null;

  constructor(
    private http: HttpClient,
    public router: Router,
    private cd: ChangeDetectorRef,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    // TODO: Load activity data for editing
    // TODO: Load units, codes, activityTypes
    // TODO: Set currentMonth
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  cancelar(): void {
    this.router.navigate(['/docente']);
  }

  isFormValid(): boolean {
    return (
      this.selectedUnit !== null &&
      this.selectedCode !== null &&
      this.selectedActivityType !== null &&
      this.dedicatedHours !== null &&
      this.description.trim().length > 0 &&
      this.selectedFile !== null
    );
  }
}
