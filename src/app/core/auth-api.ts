import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AppConfig } from './config';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  role: 'USER' | 'COMPANY';
  token: string;
}

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

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.config.apiUrl}/auth/login`, payload);
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.config.apiUrl}/auth/signup`, payload);
  }
}
