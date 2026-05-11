import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

export interface FicheTechnique {
  id: number;
  reference: string;
  nom: string;
  description?: string;
  prix_vente: number;
  cout_matiere: number;
  marge: number;
  image?: string;
  actif: boolean;
  vendable: boolean;
  categorie?: {
    id: number;
    nom: string;
    couleur?: string;
    icone?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FichesTechniquesService {
  private apiUrl = `${environment.api}/pos/fiches-techniques`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<FicheTechnique[]>(this.apiUrl);
  }

  search(q: string) {
    return this.http.get<FicheTechnique[]>(`${this.apiUrl}?q=${q}`);
  }

  getOne(id: number) {
    return this.http.get<FicheTechnique>(`${this.apiUrl}/${id}`);
  }

  create(payload: any) {
    return this.http.post<FicheTechnique>(this.apiUrl, payload);
  }

  update(id: number, payload: any) {
    return this.http.patch<FicheTechnique>(`${this.apiUrl}/${id}`, payload);
  }
}
