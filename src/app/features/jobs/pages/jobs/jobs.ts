<<<<<<< HEAD
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
=======
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
>>>>>>> c7be5d8efd3f9c83ea77dcb000852ab33d58bc4c
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { JobsApi } from '@core/jobs-api';
import { JobCard } from '@features/jobs/components/job-card/job-card';
import { Job } from '@features/jobs/models/job.model';

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
  ],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
<<<<<<< HEAD
export class Jobs implements OnInit {
=======
export class Jobs implements OnInit{
>>>>>>> c7be5d8efd3f9c83ea77dcb000852ab33d58bc4c
  private jobApi = inject(JobsApi);

  jobs = signal<Job[]>([]);
  loading = signal(true);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadJobs();
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
}
