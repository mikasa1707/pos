import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

export interface Category {
  id: number;
  nom: string;
  code: string;
  couleur?: string;
  icone?: string;
  ordre: number;
  actif: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = `${environment.api}/pos/categories`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Category[]>(this.apiUrl);
  }

  create(payload: Partial<Category>) {
    return this.http.post<Category>(this.apiUrl, payload);
  }

  update(id: number, payload: Partial<Category>) {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}