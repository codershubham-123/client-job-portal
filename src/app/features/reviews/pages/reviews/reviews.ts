import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobsApi } from '@core/jobs-api';
import { Review } from '@features/jobs/models/job.model';

@Component({ selector: 'app-reviews', imports: [CommonModule, FormsModule], templateUrl: './reviews.html', styleUrl: './reviews.scss' })
export class Reviews implements OnInit {
  private api = inject(JobsApi);
  reviews = signal<Review[]>([]);
  selectedReview = signal<Review | null>(null);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');

  filteredReviews = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.reviews();
    return this.reviews().filter((review) => [review.title, review.description, review.pros, review.cons, review.reviewerRole, review.employmentStatus, review.company?.name].some((value) => value?.toLowerCase().includes(term)));
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) { this.loading.set(false); return; }
    this.api.getReviews().subscribe({ next: (reviews) => { this.reviews.set(reviews); this.selectedReview.set(reviews[0] ?? null); this.loading.set(false); }, error: (error: Error) => { this.error.set(error.message); this.loading.set(false); } });
  }
  updateSearch(value: string): void { this.searchTerm.set(value); }
  selectReview(review: Review): void { this.selectedReview.set(review); }
  reviewDate(review: Review): string { return review.createdAt; }
}
