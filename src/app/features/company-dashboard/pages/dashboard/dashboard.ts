import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '@core/auth';
import { JobsApi } from '@core/jobs-api';
import { Company, Job, JobPayload, Review } from '@features/jobs/models/job.model';
import { experienceDisplay, salaryDisplay } from '@features/jobs/utils/display';

interface DashboardJobForm {
  title: string;
  description: string;
  location: string;
  jobType: string;
  employmentType: string;
  minExperience: number;
  maxExperience: number;
  salary: string;
  skills: string;
  companyId: number | null;
  isNew: boolean;
}

@Component({
  selector: 'app-company-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class CompanyDashboard implements OnInit {
  private api = inject(JobsApi);
  private auth = inject(Auth);

  jobs = signal<Job[]>([]);
  companies = signal<Company[]>([]);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  saving = signal(false);
  formVisible = signal(false);
  formMessage = signal('');

  jobForm = signal<DashboardJobForm>({
    title: '',
    description: '',
    location: '',
    jobType: 'Remote',
    employmentType: 'Full-time',
    minExperience: 0,
    maxExperience: 2,
    salary: '',
    skills: '',
    companyId: null as number | null,
    isNew: true,
  });

  user = this.auth.user;
  company = computed(() => this.companies()[0] ?? null);
  activeJobs = computed(() => this.jobs().filter((job) => job.isNew).length);
  averageRating = computed(() => {
    const companies = this.companies();
    if (!companies.length) return 0;
    return companies.reduce((total, company) => total + company.rating, 0) / companies.length;
  });
  openPositions = computed(() => this.companies().reduce((total, company) => total + company.openJobCount, 0));
  recentJobs = computed(() => this.jobs().slice(0, 5));
  recentReviews = computed(() => this.reviews().slice(0, 2));
  topSkills = computed(() => {
    const counts = new Map<string, number>();

    this.jobs().forEach((job) => {
      job.skills?.forEach((skill) => counts.set(skill, (counts.get(skill) ?? 0) + 1));
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 5);
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.api.getJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.api.getCompanies().subscribe({ next: (companies) => this.companies.set(companies) });
    this.api.getReviews().subscribe({ next: (reviews) => this.reviews.set(reviews) });
  }

  toggleForm(): void {
    this.formVisible.update((visible) => !visible);
    this.formMessage.set('');
  }

  updateForm(field: keyof DashboardJobForm, value: string | number | boolean | null): void {
    this.jobForm.update((form) => ({ ...form, [field]: value }));
  }

  createJob(): void {
    const form = this.jobForm();
    const payload: JobPayload = {
      title: form.title,
      description: form.description,
      location: form.location,
      jobType: form.jobType,
      employmentType: form.employmentType,
      minExperience: Number(form.minExperience),
      maxExperience: Number(form.maxExperience),
      postedAt: 'Today',
      skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      salary: form.salary,
      isNew: form.isNew,
      companyId: form.companyId,
    };

    this.saving.set(true);
    this.formMessage.set('');
    this.api.createJob(payload).subscribe({
      next: (job) => {
        this.jobs.update((jobs) => [job, ...jobs]);
        this.saving.set(false);
        this.formVisible.set(false);
        this.formMessage.set('Job created successfully.');
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.formMessage.set(error.message);
      },
    });
  }

  salary(job: Job): string {
    return salaryDisplay(job);
  }

  experience(job: Job): string {
    return experienceDisplay(job);
  }
}
