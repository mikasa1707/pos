import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { Vente } from '../../core/models/vente.model';

@Injectable({
  providedIn: 'root',
})
export class VentesService {
  private apiUrl = `${environment.api}/pos/ventes`;

  constructor(private http: HttpClient) {}

  create(payload: any) {
    return this.http.post<Vente>(this.apiUrl, payload);
  }

  getAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDashboard() {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  historique(params?: { session_caisse_id?: number; date?: string }) {
    const query = new URLSearchParams();

    if (params?.session_caisse_id) {
      query.set('session_caisse_id', String(params.session_caisse_id));
    }

    if (params?.date) {
      query.set('date', params.date);
    }

    const qs = query.toString();

    return this.http.get<any[]>(`${this.apiUrl}/historique${qs ? '?' + qs : ''}`);
  }
}
