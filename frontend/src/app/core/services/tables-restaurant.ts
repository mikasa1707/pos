import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

export interface TableRestaurant {
  id: number;
  code: string;
  nom: string;
  capacite: number;
  statut: 'LIBRE' | 'OCCUPEE' | 'RESERVEE' | 'HORS_SERVICE';
  actif: boolean;
  zone?: {
    id: number;
    nom: string;
  };
}

@Injectable({ providedIn: 'root' })
export class TablesRestaurantService {
  private apiUrl = `${environment.api}/pos/tables-restaurant`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<TableRestaurant[]>(this.apiUrl);
  }
}