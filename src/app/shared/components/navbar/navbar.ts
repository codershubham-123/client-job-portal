import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { Auth } from '@core/auth';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  auth = inject(Auth);
  router = inject(Router);

  isLoggedIn = this.auth.isLoggedIn;
  user = this.auth.user;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  isAuthPage() {
    return this.router.url.startsWith('/login') || this.router.url.startsWith('/signup');
  }
}
