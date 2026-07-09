import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiResponse } from '@features/jobs/models/job.model';

export function unwrapData<T>() {
  return (source: Observable<T | ApiResponse<T>>): Observable<T> =>
    source.pipe(map((response) => (isWrapped<T>(response) ? response.data : response)));
}

export function handleApiError(context: string) {
  return (error: HttpErrorResponse) => {
    console.error(`${context} failed`, error);
    return throwError(() => new Error(error.error?.message ?? `${context} failed. Please try again.`));
  };
}

function isWrapped<T>(response: T | ApiResponse<T>): response is ApiResponse<T> {
  return !!response && typeof response === 'object' && 'data' in response;
}
