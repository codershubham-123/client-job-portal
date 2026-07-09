import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobsApi } from '@core/jobs-api';
import { Job } from '@features/jobs/models/job.model';
import { companyInitial, experienceDisplay, salaryDisplay } from '@features/jobs/utils/display';

type JobTypeFilter = 'Remote' | 'Hybrid' | 'Onsite';
type ExperienceFilter = 'Fresher' | '1-3 Years' | '3-5 Years' | '5-8 Years' | '8+ Years';
type SalaryFilter = '₹5L - ₹10L' | '₹10L - ₹20L' | '₹20L - ₹30L' | '₹30L - ₹50L' | '₹50L+';

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
  selectedTypes = signal<Set<JobTypeFilter>>(new Set());
  selectedExperiences = signal<Set<ExperienceFilter>>(new Set());
  selectedSalary = signal<SalaryFilter | ''>('');
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
      { label: 'Hybrid', count: this.countByType(jobs, 'Hybrid'), selected: selected.has('Hybrid') },
      { label: 'Onsite', count: this.countOnsite(jobs), selected: selected.has('Onsite') },
    ];
  });

  experienceFilters = computed<FilterItem[]>(() => {
    const jobs = this.jobs();
    const selected = this.selectedExperiences();
    const filters: ExperienceFilter[] = ['Fresher', '1-3 Years', '3-5 Years', '5-8 Years', '8+ Years'];

    return filters.map((label) => ({
      label,
      count: jobs.filter((job) => this.matchesExperience(job, label)).length,
      selected: selected.has(label),
    }));
  });

  salaryFilters = computed<FilterItem[]>(() => {
    const jobs = this.jobs();
    const selected = this.selectedSalary();
    const filters: SalaryFilter[] = ['₹5L - ₹10L', '₹10L - ₹20L', '₹20L - ₹30L', '₹30L - ₹50L', '₹50L+'];

    return filters.map((label) => ({
      label,
      count: jobs.filter((job) => this.matchesSalary(job, label)).length,
      selected: selected === label,
    }));
  });

  visibleJobs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const types = this.selectedTypes();
    const experiences = this.selectedExperiences();
    const salary = this.selectedSalary();
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

      if (experiences.size > 0 && !Array.from(experiences).some((filter) => this.matchesExperience(job, filter))) {
        return false;
      }

      if (salary && !this.matchesSalary(job, salary)) {
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

  toggleExperience(label: string): void {
    const experience = label as ExperienceFilter;
    const nextExperiences = new Set(this.selectedExperiences());

    if (nextExperiences.has(experience)) {
      nextExperiences.delete(experience);
    } else {
      nextExperiences.add(experience);
    }

    this.selectedExperiences.set(nextExperiences);
  }

  updateSalary(label: string): void {
    const salary = label as SalaryFilter;
    this.selectedSalary.set(this.selectedSalary() === salary ? '' : salary);
  }

  clearFilters(): void {
    this.selectedTypes.set(new Set());
    this.selectedExperiences.set(new Set());
    this.selectedSalary.set('');
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
    return companyInitial(job.company);
  }

  getJobLocation(job: Job): string {
    return job.location;
  }

  getSalary(job: Job): string {
    return salaryDisplay(job);
  }

  getExperience(job: Job): string {
    return experienceDisplay(job);
  }

  getSkills(job: Job): string[] {
    return job.skills ?? [];
  }

  getPostedLabel(job: Job): string {
    return job.postedAt;
  }


  private matchesExperience(job: Job, filter: ExperienceFilter): boolean {
    const min = job.minExperience ?? 0;
    const max = job.maxExperience ?? min;

    switch (filter) {
      case 'Fresher':
        return min === 0;
      case '1-3 Years':
        return min <= 3 && max >= 1;
      case '3-5 Years':
        return min <= 5 && max >= 3;
      case '5-8 Years':
        return min <= 8 && max >= 5;
      case '8+ Years':
        return max >= 8 || min >= 8;
    }
  }

  private matchesSalary(job: Job, filter: SalaryFilter): boolean {
    const amount = this.salaryAmount(job);

    if (amount === null) {
      return false;
    }

    switch (filter) {
      case '₹5L - ₹10L':
        return amount >= 500000 && amount <= 1000000;
      case '₹10L - ₹20L':
        return amount >= 1000000 && amount <= 2000000;
      case '₹20L - ₹30L':
        return amount >= 2000000 && amount <= 3000000;
      case '₹30L - ₹50L':
        return amount >= 3000000 && amount <= 5000000;
      case '₹50L+':
        return amount >= 5000000;
    }
  }

  private salaryAmount(job: Job): number | null {
    if (!job.salary) {
      return null;
    }

    if (typeof job.salary === 'object') {
      return job.salary.max ?? job.salary.min ?? null;
    }

    const amounts = Array.from(job.salary.matchAll(/[\d,]+/g))
      .map(([value]) => Number(value.replace(/,/g, '')))
      .filter((value) => !Number.isNaN(value));

    return amounts.length ? Math.max(...amounts) : null;
  }

  private countByLocation(jobs: Job[], locationName: string): number {
    return jobs.filter((job) =>
      this.getJobLocation(job).toLowerCase().includes(locationName.toLowerCase()),
    ).length;
  }

  private countByType(jobs: Job[], type: string): number {
    return jobs.filter((job) => job.jobType?.toLowerCase() === type.toLowerCase()).length;
  }

  private countOnsite(jobs: Job[]): number {
    return jobs.filter((job) => {
      const location = this.getJobLocation(job).toLowerCase();
      return !location.includes('remote') && !location.includes('hybrid');
    }).length;
  }
}
