import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from './auth';

const isPublicRoute = (url: string) => {
  return /\/auth\/(login|signup)$/.test(url);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPublicRoute(req.url)) {
    return next(req);
  }

  const auth = inject(Auth);
  const token = auth.user()?.token;

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
