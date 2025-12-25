import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export interface AuthUser {
  id: number;
  email: string;
  role: 'USER' | 'COMPANY';
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private _user = signal<AuthUser | null>(null);
  user = this._user.asReadonly();

  isLoggedIn = computed(() => !!this._user());

  constructor() {
    if (this.isBrowser) {
      this.restoreUser();
    }
  }

  login(user: AuthUser) {
    this._user.set(user);
    if (this.isBrowser) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  logout() {
    this._user.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('auth_user');
    }
  }

  private restoreUser() {
    const stored = localStorage.getItem('auth_user');

    if (stored) {
      this._user.set(JSON.parse(stored));
    }
  }
}
