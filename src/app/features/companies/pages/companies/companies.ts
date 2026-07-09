import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobsApi } from '@core/jobs-api';
import { Company } from '@features/jobs/models/job.model';

@Component({
  selector: 'app-companies',
  imports: [CommonModule, FormsModule],
  templateUrl: './companies.html',
  styleUrl: './companies.scss',
})
export class Companies implements OnInit {
  private api = inject(JobsApi);
  companies = signal<Company[]>([]);
  selectedCompany = signal<Company | null>(null);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');

  topRatedCompanies = computed(() => [...this.companies()].sort((a, b) => b.rating - a.rating).slice(0, 3));
  filteredCompanies = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.companies();
    return this.companies().filter((company) =>
      [company.name, company.industry, company.location, company.description].some((value) => value?.toLowerCase().includes(term)),
    );
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) { this.loading.set(false); return; }
    this.api.getCompanies().subscribe({
      next: (companies) => { this.companies.set(companies); this.selectedCompany.set(companies[0] ?? null); this.loading.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.loading.set(false); },
    });
  }

  selectCompany(company: Company): void { this.selectedCompany.set(company); }
  updateSearch(value: string): void { this.searchTerm.set(value); }
}
