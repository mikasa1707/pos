import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: 'ADMIN' | 'CAISSIER' | 'RESPONSABLE_CAISSE';
  actif: boolean;
}

@Injectable({ providedIn: 'root' })
export class UtilisateursService {
  private apiUrl = `${environment.api}/pos/utilisateurs`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  create(payload: any) {
    return this.http.post(this.apiUrl, payload);
  }

  update(id: number, payload: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}