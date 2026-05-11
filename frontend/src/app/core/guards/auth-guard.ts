import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Role } from '../services/auth';

const accessMap: Record<Role, string[]> = {
  ADMIN: [
    'caisse',
    'dashboard',
    'produits',
    'categories',
    'historique',
    'cloture',
    'livraisons',
    'utilisateurs',
  ],
  CAISSIER: ['caisse', 'cloture', 'historique'],
  RESPONSABLE_CAISSE: ['caisse', 'cloture', 'produits', 'categories', 'utilisateurs'],
};

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const role = auth.getRole();
  const path = route.routeConfig?.path || '';

  if (!role || !accessMap[role]) {
    auth.logout();
    return router.createUrlTree(['/login']);
  }

  if (accessMap[role].includes(path)) {
    return true;
  }

  return router.createUrlTree(['/pos/caisse']);
};
