import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Job } from '@features/jobs/models/job.model';

@Component({
  selector: 'app-job-card',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './job-card.html',
  styleUrl: './job-card.scss',
})
export class JobCard {
@Input({required : true}) job! : Job;
}
