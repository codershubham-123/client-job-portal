import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

/**
 * Authenticated user information stored in frontend state.
 */

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

  /**
   * Internal signal holding the current authenticated user.
   * Null indicates no active session.
   */

  private _user = signal<AuthUser | null>(null);
  /**
   * Read-only user signal exposed to the application.
   */
  user = this._user.asReadonly();

  isLoggedIn = computed(() => !!this._user());

  constructor() {
    // Restore persisted user session when application starts.
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

  /**
   * Clears authentication state
   * and removes persisted session.
   */
  logout() {
    this._user.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Restores previously saved user session
   * from localStorage.
   */
  private restoreUser() {
    const stored = localStorage.getItem('auth_user');

    if (stored) {
      this._user.set(JSON.parse(stored));
    }
  }
}
