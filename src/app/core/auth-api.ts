import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AppConfig } from './config';
import { Observable } from 'rxjs';

/**
 * Login request payload.
 */

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response returned by backend.
 */
export interface LoginResponse {
  id: number;
  email: string;
  role: 'USER' | 'COMPANY';
  token: string;
}

/**
 * Registration request payload.
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private http = inject(HttpClient);
  private config = inject(AppConfig);

  /**
   * Authenticates user credentials
   * and returns JWT token with user details.
   */
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.config.apiUrl}/auth/login`, payload);
  }

  /**
   * Creates a new user account.
   */
  register(payload: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.config.apiUrl}/auth/signup`, payload);
  }
}
