import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { AppConfig } from './config';
import { handleApiError, unwrapData } from './api-utils';
import {
  ApiResponse,
  Company,
  CompanyPayload,
  Job,
  JobPayload,
  Review,
  ReviewPayload,
  SavedJob,
  SavedJobStatus,
} from '@features/jobs/models/job.model';

@Injectable({ providedIn: 'root' })
export class JobsApi {
  private http = inject(HttpClient);
  private config = inject(AppConfig);

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[] | ApiResponse<Job[]>>(`${this.config.apiUrl}/jobs`).pipe(
      unwrapData<Job[]>(),
      map((jobs) => jobs.map(normalizeJob)),
      catchError(handleApiError('Load jobs')),
    );
  }

  getJob(id: number): Observable<Job> {
    return this.http
      .get<Job | ApiResponse<Job>>(`${this.config.apiUrl}/jobs/${id}`)
      .pipe(unwrapData<Job>(), map(normalizeJob), catchError(handleApiError('Load job')));
  }

  getSavedJobs(): Observable<SavedJob[]> {
    return this.http
      .get<SavedJob[] | ApiResponse<SavedJob[]>>(`${this.config.apiUrl}/saved-jobs`)
      .pipe(
        unwrapData<SavedJob[]>(),
        map((jobs) => jobs.map((job) => ({ ...normalizeJob(job), savedAt: job.savedAt }))),
        catchError(handleApiError('Load saved jobs')),
      );
  }

  getSavedJobIds(): Observable<number[]> {
    return this.http
      .get<number[] | ApiResponse<number[]>>(`${this.config.apiUrl}/saved-jobs/ids`)
      .pipe(unwrapData<number[]>(), catchError(handleApiError('Load saved job IDs')));
  }

  saveJob(jobId: number): Observable<SavedJobStatus> {
    return this.http
      .post<
        SavedJobStatus | ApiResponse<SavedJobStatus>
      >(`${this.config.apiUrl}/saved-jobs/${jobId}`, null)
      .pipe(unwrapData<SavedJobStatus>(), catchError(handleApiError('Save job')));
  }

  unsaveJob(jobId: number): Observable<SavedJobStatus> {
    return this.http
      .delete<
        SavedJobStatus | ApiResponse<SavedJobStatus>
      >(`${this.config.apiUrl}/saved-jobs/${jobId}`)
      .pipe(unwrapData<SavedJobStatus>(), catchError(handleApiError('Unsave job')));
  }

  createJob(payload: JobPayload): Observable<Job> {
    return this.http
      .post<Job | ApiResponse<Job>>(`${this.config.apiUrl}/jobs`, payload)
      .pipe(unwrapData<Job>(), catchError(handleApiError('Create job')));
  }

  updateJob(id: number, payload: JobPayload): Observable<Job> {
    return this.http
      .put<Job | ApiResponse<Job>>(`${this.config.apiUrl}/jobs/${id}`, payload)
      .pipe(unwrapData<Job>(), catchError(handleApiError('Update job')));
  }

  deleteJob(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.config.apiUrl}/jobs/${id}`)
      .pipe(catchError(handleApiError('Delete job')));
  }

  getCompanies(): Observable<Company[]> {
    return this.http
      .get<Company[] | ApiResponse<Company[]>>(`${this.config.apiUrl}/companies`)
      .pipe(unwrapData<Company[]>(), catchError(handleApiError('Load companies')));
  }

  getCompany(id: number): Observable<Company> {
    return this.http
      .get<Company | ApiResponse<Company>>(`${this.config.apiUrl}/companies/${id}`)
      .pipe(unwrapData<Company>(), catchError(handleApiError('Load company')));
  }

  createCompany(payload: CompanyPayload): Observable<Company> {
    return this.http
      .post<Company | ApiResponse<Company>>(`${this.config.apiUrl}/companies`, payload)
      .pipe(unwrapData<Company>(), catchError(handleApiError('Create company')));
  }

  updateCompany(id: number, payload: CompanyPayload): Observable<Company> {
    return this.http
      .put<Company | ApiResponse<Company>>(`${this.config.apiUrl}/companies/${id}`, payload)
      .pipe(unwrapData<Company>(), catchError(handleApiError('Update company')));
  }

  deleteCompany(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.config.apiUrl}/companies/${id}`)
      .pipe(catchError(handleApiError('Delete company')));
  }

  getReviews(): Observable<Review[]> {
    return this.http
      .get<Review[] | ApiResponse<Review[]>>(`${this.config.apiUrl}/reviews`)
      .pipe(unwrapData<Review[]>(), catchError(handleApiError('Load reviews')));
  }

  getCompanyReviews(companyId: number): Observable<Review[]> {
    return this.http
      .get<Review[] | ApiResponse<Review[]>>(`${this.config.apiUrl}/companies/${companyId}/reviews`)
      .pipe(unwrapData<Review[]>(), catchError(handleApiError('Load company reviews')));
  }

  getCompanyReview(companyId: number, reviewId: number): Observable<Review> {
    return this.http
      .get<
        Review | ApiResponse<Review>
      >(`${this.config.apiUrl}/companies/${companyId}/reviews/${reviewId}`)
      .pipe(unwrapData<Review>(), catchError(handleApiError('Load review')));
  }

  createCompanyReview(companyId: number, payload: ReviewPayload): Observable<Review> {
    return this.http
      .post<
        Review | ApiResponse<Review>
      >(`${this.config.apiUrl}/companies/${companyId}/reviews`, payload)
      .pipe(unwrapData<Review>(), catchError(handleApiError('Create review')));
  }

  updateCompanyReview(
    companyId: number,
    reviewId: number,
    payload: ReviewPayload,
  ): Observable<Review> {
    return this.http
      .put<
        Review | ApiResponse<Review>
      >(`${this.config.apiUrl}/companies/${companyId}/reviews/${reviewId}`, payload)
      .pipe(unwrapData<Review>(), catchError(handleApiError('Update review')));
  }

  deleteCompanyReview(companyId: number, reviewId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.config.apiUrl}/companies/${companyId}/reviews/${reviewId}`)
      .pipe(catchError(handleApiError('Delete review')));
  }
}

type BackendJob = Partial<Job> & {
  new?: boolean;
  minSalary?: number | string;
  maxSalary?: number | string;
  experience?: { minYears?: number | null; maxYears?: number | null };
};

function normalizeJob(job: BackendJob): Job {
  const minSalary = numberOrUndefined(job.minSalary);
  const maxSalary = numberOrUndefined(job.maxSalary);
  const salary =
    job.salary ??
    (minSalary !== undefined || maxSalary !== undefined
      ? { min: minSalary, max: maxSalary }
      : null);

  return {
    ...job,
    minExperience: job.minExperience ?? job.experience?.minYears ?? null,
    maxExperience: job.maxExperience ?? job.experience?.maxYears ?? null,
    salary,
    isNew: job.isNew ?? job.new ?? false,
  } as Job;
}

function numberOrUndefined(value: number | string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}
