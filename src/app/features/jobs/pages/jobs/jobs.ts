import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, OnInit, PLATFORM_ID, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { JobsApi } from '@core/jobs-api';
import { Auth } from '@core/auth';
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
  private auth = inject(Auth);
  private router = inject(Router);

  jobs = signal<Job[]>([]);
  selectedTypes = signal<Set<string>>(new Set());
  selectedExperiences = signal<Set<string>>(new Set());
  selectedSalaries = signal<Set<string>>(new Set());
  topCompanies = signal<Company[]>([]);
  loading = signal(true);
  savedJobIds = signal<Set<number>>(new Set());
  savingJobIds = signal<Set<number>>(new Set());
  quickFilters = ['Remote', 'Frontend', 'React', 'Java', 'AI/ML', 'Startup'];
  jobTypeFilters = ['Remote', 'Hybrid', 'Onsite'];
  experienceFilters = ['Fresher', '1-3 Years', '3-5 Years', '5-8 Years', '8+ Years'];
  salaryFilters = ['₹5L - ₹10L', '₹10L - ₹20L', '₹20L - ₹30L', '₹30L - ₹50L', '₹50L+'];

  filteredJobs = computed(() =>
    this.jobs().filter(
      (job) =>
        this.matchesType(job) &&
        this.matchesExperienceFilters(job) &&
        this.matchesSalaryFilters(job),
    ),
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadJobs();
      this.loadCompanies();
      this.loadSavedJobIds();
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

  toggleType(type: string): void {
    this.toggleSet(this.selectedTypes, type);
  }

  toggleExperience(experience: string): void {
    this.toggleSet(this.selectedExperiences, experience);
  }

  toggleSalary(salary: string): void {
    this.toggleSet(this.selectedSalaries, salary);
  }

  isTypeSelected(type: string): boolean {
    return this.selectedTypes().has(type);
  }

  isExperienceSelected(experience: string): boolean {
    return this.selectedExperiences().has(experience);
  }

  isSalarySelected(salary: string): boolean {
    return this.selectedSalaries().has(salary);
  }

  countByType(type: string): number {
    return this.jobs().filter((job) => this.jobType(job) === type.toLowerCase()).length;
  }

  countByExperience(experience: string): number {
    return this.jobs().filter((job) => this.matchesExperience(job, experience)).length;
  }

  countBySalary(salary: string): number {
    return this.jobs().filter((job) => this.matchesSalary(job, salary)).length;
  }

  loadCompanies(): void {
    this.jobApi.getCompanies().subscribe({
      next: (companies) =>
        this.topCompanies.set([...companies].sort((a, b) => b.rating - a.rating).slice(0, 3)),
      error: (err) => console.error('Failed to load companies', err),
    });
  }

  isSaveAvailable(): boolean {
    return !this.auth.isLoggedIn() || this.auth.user()?.role === 'USER';
  }

  isSaved(job: Job): boolean {
    return this.savedJobIds().has(job.id);
  }

  isSaving(job: Job): boolean {
    return this.savingJobIds().has(job.id);
  }

  toggleSaved(job: Job): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.auth.user()?.role !== 'USER' || this.isSaving(job)) {
      return;
    }

    this.setSaving(job.id, true);
    const request = this.isSaved(job) ? this.jobApi.unsaveJob(job.id) : this.jobApi.saveJob(job.id);

    request.subscribe({
      next: ({ saved }) => {
        const ids = new Set(this.savedJobIds());
        if (saved) {
          ids.add(job.id);
        } else {
          ids.delete(job.id);
        }
        this.savedJobIds.set(ids);
        this.setSaving(job.id, false);
      },
      error: (error) => {
        console.error('Failed to update saved job', error);
        this.setSaving(job.id, false);
      },
    });
  }

  private loadSavedJobIds(): void {
    if (this.auth.user()?.role !== 'USER') {
      return;
    }

    this.jobApi.getSavedJobIds().subscribe({
      next: (ids) => this.savedJobIds.set(new Set(ids)),
      error: (error) => console.error('Failed to load saved job IDs', error),
    });
  }

  private setSaving(jobId: number, saving: boolean): void {
    const ids = new Set(this.savingJobIds());
    if (saving) {
      ids.add(jobId);
    } else {
      ids.delete(jobId);
    }
    this.savingJobIds.set(ids);
  }

  private toggleSet(
    target: { set(value: Set<string>): void; (): Set<string> },
    value: string,
  ): void {
    const next = new Set(target());

    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }

    target.set(next);
  }

  private matchesType(job: Job): boolean {
    const selected = this.selectedTypes();
    return selected.size === 0 || selected.has(this.normalizedTypeLabel(job));
  }

  private matchesExperienceFilters(job: Job): boolean {
    const selected = this.selectedExperiences();
    return (
      selected.size === 0 ||
      Array.from(selected).some((filter) => this.matchesExperience(job, filter))
    );
  }

  private matchesSalaryFilters(job: Job): boolean {
    const selected = this.selectedSalaries();
    return (
      selected.size === 0 || Array.from(selected).some((filter) => this.matchesSalary(job, filter))
    );
  }

  private normalizedTypeLabel(job: Job): string {
    const type = this.jobType(job);

    if (type.includes('remote')) return 'Remote';
    if (type.includes('hybrid')) return 'Hybrid';
    return 'Onsite';
  }

  private jobType(job: Job): string {
    return `${job.jobType || job.location || ''}`.toLowerCase();
  }

  private matchesExperience(job: Job, filter: string): boolean {
    const min = job.minExperience ?? 0;
    const max = job.maxExperience ?? min;

    if (filter === 'Fresher') return min === 0;
    if (filter === '1-3 Years') return min <= 3 && max >= 1;
    if (filter === '3-5 Years') return min <= 5 && max >= 3;
    if (filter === '5-8 Years') return min <= 8 && max >= 5;
    return max >= 8 || min >= 8;
  }

  private matchesSalary(job: Job, filter: string): boolean {
    const amount = this.salaryAmount(job);

    if (amount === null) return false;
    if (filter === '₹5L - ₹10L') return amount >= 500000 && amount <= 1000000;
    if (filter === '₹10L - ₹20L') return amount >= 1000000 && amount <= 2000000;
    if (filter === '₹20L - ₹30L') return amount >= 2000000 && amount <= 3000000;
    if (filter === '₹30L - ₹50L') return amount >= 3000000 && amount <= 5000000;
    return amount >= 5000000;
  }

  private salaryAmount(job: Job): number | null {
    if (!job.salary) return null;
    if (typeof job.salary === 'object') return job.salary.max ?? job.salary.min ?? null;

    const values = Array.from(job.salary.matchAll(/[\d,]+/g)).map(([value]) =>
      Number(value.replace(/,/g, '')),
    );

    return values.length ? Math.max(...values) : null;
  }
}
