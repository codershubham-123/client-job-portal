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
  job = input.required<Job>();
  showSave = input(false);
  saved = input(false);
  saving = input(false);
  save = output<void>();

  salary = salaryDisplay;
  experience = experienceDisplay;
  initial = companyInitial;
}
