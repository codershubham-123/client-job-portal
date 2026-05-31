import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'jobs',
    loadComponent: () => import('./features/jobs/pages/jobs/jobs').then((m) => m.Jobs),
  },
  {
    path: 'jobs/all',
    loadComponent: () => import('./features/jobs/pages/all-jobs/all-jobs').then((m) => m.AllJobs),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
