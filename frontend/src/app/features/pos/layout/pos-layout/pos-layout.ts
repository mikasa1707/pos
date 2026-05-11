import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

type Role = 'ADMIN' | 'CAISSIER' | 'RESPONSABLE_CAISSE';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './pos-layout.html',
  styleUrl: './pos-layout.scss',
})
export class PosLayout {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}
  get role() {
    return this.auth.getRole();
  }

  canAccess(path: string): boolean {
    if (this.role === 'ADMIN') return true;

    if (this.role === 'CAISSIER') {
      return ['caisse', 'cloture'].includes(path);
    }

    if (this.role === 'RESPONSABLE_CAISSE') {
      return ['caisse', 'cloture', 'produits', 'categories', 'utilisateurs'].includes(path);
    }

    return false;
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
