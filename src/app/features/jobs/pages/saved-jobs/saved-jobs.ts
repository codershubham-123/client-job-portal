import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@core/auth';
import { JobsApi } from '@core/jobs-api';
import { JobCard } from '@features/jobs/components/job-card/job-card';
import { SavedJob } from '@features/jobs/models/job.model';

@Component({
  selector: 'app-saved-jobs',
  imports: [CommonModule, RouterLink, JobCard],
  templateUrl: './saved-jobs.html',
  styleUrl: './saved-jobs.scss',
})
export class SavedJobs implements OnInit {
  private auth = inject(Auth);
  private jobApi = inject(JobsApi);
  private router = inject(Router);

  jobs = signal<SavedJob[]>([]);
  loading = signal(true);
  // Track requests by job ID to prevent duplicate unsave clicks on an individual card.
  savingJobIds = signal<Set<number>>(new Set());

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Saved jobs depend on browser-only auth state stored in localStorage.
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    if (!this.auth.isLoggedIn()) {
      // Match the Save button behavior by sending guests to login.
      this.router.navigate(['/login']);
      return;
    }

    if (this.auth.user()?.role !== 'USER') {
      // Company accounts are authenticated but do not have a saved-jobs collection.
      this.router.navigate(['/jobs']);
      return;
    }

    this.loadSavedJobs();
  }

  isSaving(job: SavedJob): boolean {
    return this.savingJobIds().has(job.id);
  }

  unsave(job: SavedJob): void {
    if (this.isSaving(job)) {
      return;
    }

    // Leave the card in place until the API succeeds, so a failed request is recoverable.
    this.setSaving(job.id, true);
    this.jobApi.unsaveJob(job.id).subscribe({
      next: () => {
        this.jobs.update((jobs) => jobs.filter((savedJob) => savedJob.id !== job.id));
        this.setSaving(job.id, false);
      },
      error: (error) => {
        console.error('Failed to remove saved job', error);
        this.setSaving(job.id, false);
      },
    });
  }

  private loadSavedJobs(): void {
    // This endpoint returns full cards, including savedAt, for the dedicated page.
    this.jobApi.getSavedJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load saved jobs', error);
        this.loading.set(false);
      },
    });
  }

  private setSaving(jobId: number, saving: boolean): void {
    // Signals require a new Set reference to update the affected card's disabled state.
    const ids = new Set(this.savingJobIds());
    if (saving) {
      ids.add(jobId);
    } else {
      ids.delete(jobId);
    }
    this.savingJobIds.set(ids);
  }
}
