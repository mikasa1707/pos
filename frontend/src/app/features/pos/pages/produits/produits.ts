import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FicheTechnique,
  FichesTechniquesService,
} from '../../../../core/services/fiches-techniques';
import { Category, CategoriesService } from '../../../../core/services/categories';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.html',
  styleUrl: './produits.scss',
})
export class Produits implements OnInit {
  items: FicheTechnique[] = [];
  categories: Category[] = [];

  form: any = this.emptyForm();
  selectedId: number | null = null;
  modalOpen = false;

  constructor(
    private ftService: FichesTechniquesService,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  emptyForm() {
    return {
      reference: '',
      nom: '',
      description: '',
      prix_vente: 0,
      cout_matiere: 0,
      categorie_id: null,
      actif: true,
      vendable: true,
    };
  }

  load() {
    this.ftService.getAll().subscribe((res) => {
      this.items = res;
      this.cdr.detectChanges();
    });
    this.categoriesService.getAll().subscribe((res) => {
      this.categories = res;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.selectedId = null;
    this.form = this.emptyForm();
    this.modalOpen = true;
  }

  openEdit(item: FicheTechnique) {
    this.selectedId = item.id;
    this.form = {
      reference: item.reference,
      nom: item.nom,
      description: item.description || '',
      prix_vente: item.prix_vente,
      cout_matiere: item.cout_matiere,
      categorie_id: item.categorie?.id || null,
      actif: item.actif,
      vendable: item.vendable,
    };
    this.modalOpen = true;
  }

  save() {
    const req = this.selectedId
      ? this.ftService.update(this.selectedId, this.form)
      : this.ftService.create(this.form);

    req.subscribe(() => {
      this.modalOpen = false;
      this.load();
    });
  }
}
