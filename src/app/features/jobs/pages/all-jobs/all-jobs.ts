import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobsApi } from '@core/jobs-api';
import { Job } from '@features/jobs/models/job.model';

type JobTypeFilter = 'Remote' | 'Hybrid' | 'Onsite';

interface FilterItem {
  label: string;
  count: number;
  selected?: boolean;
}

@Component({
  selector: 'app-all-jobs',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './all-jobs.html',
  styleUrl: './all-jobs.scss',
})
export class AllJobs implements OnInit {
  private jobApi = inject(JobsApi);

  jobs = signal<Job[]>([]);
  loading = signal(true);
  selectedJob = signal<Job | null>(null);
  searchTerm = signal('');
  sortBy = signal('newest');
  selectedTypes = signal<Set<JobTypeFilter>>(new Set(['Remote']));
  quickFilters = ['Remote', 'Frontend', 'React', 'Java', 'AI/ML', 'Startup'];

  jobTypeFilters = computed<FilterItem[]>(() => {
    const jobs = this.jobs();
    const selected = this.selectedTypes();

    return [
      {
        label: 'Remote',
        count: this.countByLocation(jobs, 'Remote'),
        selected: selected.has('Remote'),
      },
      { label: 'Hybrid', count: 76, selected: selected.has('Hybrid') },
      { label: 'Onsite', count: this.countOnsite(jobs), selected: selected.has('Onsite') },
    ];
  });

  visibleJobs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const types = this.selectedTypes();
    const sortedJobs = [...this.jobs()].sort((first, second) => {
      if (this.sortBy() === 'oldest') {
        return first.id - second.id;
      }

      return second.id - first.id;
    });

    return sortedJobs.filter((job) => {
      const location = this.getJobLocation(job).toLowerCase();
      const companyName = this.getCompanyName(job).toLowerCase();
      const matchesTerm =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        companyName.includes(term) ||
        location.includes(term);

      if (!matchesTerm) {
        return false;
      }

      if (types.size === 0) {
        return true;
      }

      if (types.has('Remote') && location.includes('remote')) {
        return true;
      }

      if (types.has('Onsite') && !location.includes('remote') && !location.includes('hybrid')) {
        return true;
      }

      return types.has('Hybrid') && location.includes('hybrid');
    });
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadJobs();
      return;
    }

    this.loading.set(false);
  }

  loadJobs(): void {
    this.jobApi.getJobs().subscribe({
      next: (res) => {
        this.jobs.set(res);
        this.selectedJob.set(res[0] ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load jobs', err);
        this.loading.set(false);
      },
    });
  }

  selectJob(job: Job): void {
    this.selectedJob.set(job);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateSort(value: string): void {
    this.sortBy.set(value);
  }

  toggleType(label: string): void {
    const type = label as JobTypeFilter;
    const nextTypes = new Set(this.selectedTypes());

    if (nextTypes.has(type)) {
      nextTypes.delete(type);
    } else {
      nextTypes.add(type);
    }

    this.selectedTypes.set(nextTypes);
  }

  clearFilters(): void {
    this.selectedTypes.set(new Set());
    this.searchTerm.set('');
  }

  setQuickFilter(chip: string): void {
    this.searchTerm.set(chip);
  }

  isSelected(job: Job): boolean {
    return this.selectedJob()?.id === job.id;
  }

  getCompanyName(job: Job): string {
    return job.company?.name ?? 'Confidential Company';
  }

  getCompanyInitial(job: Job): string {
    return this.getCompanyName(job).charAt(0).toUpperCase();
  }

  getJobLocation(job: Job): string {
    return job.location ?? 'Location not specified';
  }

  getSalary(job: Job): string {
    return `₹${job.minSalary} - ₹${job.maxSalary}`;
  }

  getExperience(job: Job): string {
    const title = job.title.toLowerCase();

    if (title.includes('senior') || job.id <= 2) {
      return '5+ Years';
    }

    if (title.includes('frontend')) {
      return '2-4 Years';
    }

    return '3-5 Years';
  }

  getSkills(job: Job): string[] {
    const text = `${job.title} ${job.description}`.toLowerCase();

    if (text.includes('frontend') || text.includes('react')) {
      return ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'];
    }

    if (text.includes('java') || text.includes('backend') || text.includes('spring')) {
      return ['Java', 'Spring Boot', 'AWS', 'MySQL'];
    }

    if (text.includes('cloud') || text.includes('azure')) {
      return ['Azure', 'Kubernetes', 'CI/CD', 'Terraform'];
    }

    if (text.includes('devops')) {
      return ['Docker', 'Jenkins', 'CI/CD', 'Automation'];
    }

    return ['Python', 'Django', 'PostgreSQL', 'Docker'];
  }

  getPostedLabel(job: Job): string {
    return `${Math.max(1, job.id % 5)} day${job.id % 5 === 1 ? '' : 's'} ago`;
  }

  private countByLocation(jobs: Job[], locationName: string): number {
    return jobs.filter((job) =>
      this.getJobLocation(job).toLowerCase().includes(locationName.toLowerCase()),
    ).length;
  }

  private countOnsite(jobs: Job[]): number {
    return jobs.filter((job) => {
      const location = this.getJobLocation(job).toLowerCase();
      return !location.includes('remote') && !location.includes('hybrid');
    }).length;
  }
}
