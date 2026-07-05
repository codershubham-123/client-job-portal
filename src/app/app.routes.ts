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
    path: 'companies',
    loadComponent: () => import('./features/companies/pages/companies/companies').then((m) => m.Companies),
  },
  {
    path: 'reviews',
    loadComponent: () => import('./features/reviews/pages/reviews/reviews').then((m) => m.Reviews),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
