import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const customerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('Customer')) {
    return true;
  }
  
  if (authService.hasRole('CMS')) {
      return router.parseUrl('/cms');
  }
  
  return router.parseUrl('/login');
};
