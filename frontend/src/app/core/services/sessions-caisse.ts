import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

export interface SessionCaisse {
  id: number;
  fond_caisse: number;
  total_ventes: number;
  total_espece: number;
  total_mvola: number;
  total_carte: number;
  total_attendu: number;
  montant_reel: number;
  ecart: number;
  statut: 'OUVERTE' | 'CLOTUREE';
  date_ouverture: string;
  date_cloture?: string;
}

@Injectable({ providedIn: 'root' })
export class SessionsCaisseService {
  private apiUrl = `${environment.api}/pos/sessions-caisse`;

  constructor(private http: HttpClient) {}

  getOuverte(utilisateurId: number) {
    return this.http.get<SessionCaisse | null>(
      `${this.apiUrl}/ouverte?utilisateur_id=${utilisateurId}`,
    );
  }

  ouvrir(payload: { utilisateur_id: number; fond_caisse: number; poste_caisse_id : number }) {
    return this.http.post<SessionCaisse>(`${this.apiUrl}/ouvrir`, payload);
  }

  cloturer(id: number, payload: { montant_reel: number; commentaire?: string }) {
    return this.http.post<SessionCaisse>(`${this.apiUrl}/${id}/cloturer`, payload);
  }

  getAll() {
    return this.http.get<SessionCaisse[]>(this.apiUrl);
  }

  getDerniereCloture(utilisateurId: number) {
    return this.http.get<SessionCaisse | null>(
      `${this.apiUrl}/derniere-cloture?utilisateur_id=${utilisateurId}`,
    );
  }

  rapportJson(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}/rapport-json`);
  }

  rapportExcel(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/rapport-excel`, {
      responseType: 'blob',
    });
  }
}
