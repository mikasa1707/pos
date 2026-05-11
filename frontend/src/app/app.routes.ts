import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Login } from './features/auth/login/login';
import { Caisse } from './features/pos/pages/caisse/caisse';
import { Categories } from './features/pos/pages/categories/categories';
import { ClotureCaisse } from './features/pos/pages/cloture-caisse/cloture-caisse';
import { DashboardVentes } from './features/pos/pages/dashboard-ventes/dashboard-ventes';
import { HistoriqueVentes } from './features/pos/pages/historique-ventes/historique-ventes';
import { Livraisons } from './features/pos/pages/livraisons/livraisons';
import { Produits } from './features/pos/pages/produits/produits';
import { PosLayout } from './features/pos/layout/pos-layout/pos-layout';
import { Utilisateurs } from './features/pos/pages/utilisateurs/utilisateurs';
import { Restaurant } from './features/pos/pages/restaurant/restaurant';

export const routes: Routes = [
  { path: '', redirectTo: 'pos/caisse', pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: 'pos',
    component: PosLayout,
    children: [
      { path: '', redirectTo: 'caisse', pathMatch: 'full' },
      { path: 'caisse', component: Caisse, canActivate: [authGuard] },
      { path: 'dashboard', component: DashboardVentes, canActivate: [authGuard] },
      { path: 'produits', component: Produits, canActivate: [authGuard] },
      { path: 'categories', component: Categories, canActivate: [authGuard] },
      { path: 'historique', component: HistoriqueVentes, canActivate: [authGuard] },
      { path: 'cloture', component: ClotureCaisse, canActivate: [authGuard] },
      { path: 'livraisons', component: Livraisons, canActivate: [authGuard] },
      { path: 'utilisateurs', component: Utilisateurs, canActivate: [authGuard] },
      { path: 'restaurant', component: Restaurant, canActivate: [authGuard] },
    ],
  },
];
