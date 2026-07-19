import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Don't attach token to auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned).pipe(
      tap({
        error: (err) => {
          if (err.status === 401) {
            authService.logout();
          }
        }
      })
    );
  }

  return next(req);
};
