import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

@Injectable({ providedIn: 'root' })
export class CommandesRestaurantService {
  private apiUrl = `${environment.api}/pos/commandes-restaurant`;

  constructor(private http: HttpClient) {}

  getOuvertes() {
    return this.http.get<any[]>(`${this.apiUrl}/ouvertes`);
  }

  ouvrir(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/ouvrir`, payload);
  }

  ajouterLigne(commandeId: number, payload: any) {
    return this.http.post<any>(`${this.apiUrl}/${commandeId}/lignes`, payload);
  }

  changerQuantiteLigne(ligneId: number, quantite: number) {
    return this.http.patch<any>(`${this.apiUrl}/lignes/${ligneId}/quantite`, {
      quantite,
    });
  }

  envoyerPreparation(id: number) {
    return this.http.patch<any>(`${this.apiUrl}/${id}/envoyer-preparation`, {});
  }

  marquerServie(id: number) {
    return this.http.patch<any>(`${this.apiUrl}/${id}/servie`, {});
  }

  annuler(id: number, payload?: { code_admin?: string }) {
    return this.http.patch<any>(`${this.apiUrl}/${id}/annuler`, payload || {});
  }

  payer(id: number, payload: any) {
    return this.http.post<any>(`${this.apiUrl}/${id}/payer`, payload);
  }

  findOne(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
