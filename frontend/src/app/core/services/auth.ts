import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environment';

export type Role = 'ADMIN' | 'CAISSIER' | 'RESPONSABLE_CAISSE';

export interface AuthUser {
  id: number;
  nom: string;
  email: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.api}/auth`;

  login(email: string, mot_de_passe: string) {
    return this.http.post<{ access_token: string; user: AuthUser }>(
      `${this.apiUrl}/login`,
      { email, mot_de_passe },
    );
  }

  saveSession(res: { access_token: string; user: AuthUser }) {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('token');
  }

  getUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  getRole(): Role | null {
    return this.getUser()?.role || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}