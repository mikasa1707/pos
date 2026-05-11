import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category, CategoriesService } from '../../../../core/services/categories';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  items: Category[] = [];
  form: Partial<Category> = this.emptyForm();
  selectedId: number | null = null;
  modalOpen = false;

  constructor(
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  emptyForm(): Partial<Category> {
    return {
      nom: '',
      code: '',
      couleur: '#111827',
      icone: 'fa-tags',
      ordre: 0,
      actif: true,
    };
  }

  load(): void {
    this.categoriesService.getAll().subscribe((res) => {
      this.items = res;
        this.cdr.detectChanges();
    });
  }

  openCreate(): void {
    this.selectedId = null;
    this.form = this.emptyForm();
    this.modalOpen = true;
  }

  openEdit(item: Category): void {
    this.selectedId = item.id;
    this.form = { ...item };
    this.modalOpen = true;
  }

  save(): void {
    if (!this.form.nom?.trim()) {
      alert('Nom obligatoire');
      return;
    }

    if (!this.form.code?.trim()) {
      this.form.code = this.form.nom.toUpperCase().replaceAll(' ', '_').replaceAll('/', '_');
    }

    const req = this.selectedId
      ? this.categoriesService.update(this.selectedId, this.form)
      : this.categoriesService.create(this.form);

    req.subscribe(() => {
      this.modalOpen = false;
      this.load();
    });
  }

  remove(item: Category): void {
    if (!confirm(`Désactiver la catégorie "${item.nom}" ?`)) return;

    this.categoriesService.delete(item.id).subscribe(() => {
      this.load();
    });
  }
}
