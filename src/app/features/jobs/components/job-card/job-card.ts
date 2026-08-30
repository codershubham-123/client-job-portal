import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Job } from '@features/jobs/models/job.model';
import { companyInitial, experienceDisplay, salaryDisplay } from '@features/jobs/utils/display';

@Component({
  selector: 'app-job-card',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './job-card.html',
  styleUrl: './job-card.scss',
})
export class JobCard {
  // The same card is used on job listings and the saved-jobs page; callers opt into save controls.
  job = input.required<Job>();
  showSave = input(false);
  saved = input(false);
  saving = input(false);
  // The parent owns the API call and supplies the optimistic saved state back to this card.
  save = output<void>();

  salary = salaryDisplay;
  experience = experienceDisplay;
  initial = companyInitial;
}
