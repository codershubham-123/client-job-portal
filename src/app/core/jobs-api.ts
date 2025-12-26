import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AppConfig } from './config';
import { Observable } from 'rxjs';
import { Job } from '@features/jobs/models/job.model';

@Injectable({
  providedIn: 'root',
})
export class JobsApi {
  private http = inject(HttpClient);
  private config = inject(AppConfig);

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.config.apiUrl}/jobs`);
  }
}
