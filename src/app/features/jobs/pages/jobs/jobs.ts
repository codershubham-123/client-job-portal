import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { JobsApi } from '@core/jobs-api';
import { JobCard } from '@features/jobs/components/job-card/job-card';
import { Company, Job } from '@features/jobs/models/job.model';

@Component({
  selector: 'app-jobs',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    JobCard,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {
  private jobApi = inject(JobsApi);

  jobs = signal<Job[]>([]);
  topCompanies = signal<Company[]>([]);
  loading = signal(true);
  quickFilters = ['Remote', 'Frontend', 'React', 'Java', 'AI/ML', 'Startup'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadJobs();
      this.loadCompanies();
    }
  }

  loadJobs(): void {
    this.jobApi.getJobs().subscribe({
      next: (res) => {
        this.jobs.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load jobs', err);
        this.loading.set(false);
      },
    });
  }

  loadCompanies(): void {
    this.jobApi.getCompanies().subscribe({
      next: (companies) => this.topCompanies.set([...companies].sort((a, b) => b.rating - a.rating).slice(0, 3)),
      error: (err) => console.error('Failed to load companies', err),
    });
  }
}

