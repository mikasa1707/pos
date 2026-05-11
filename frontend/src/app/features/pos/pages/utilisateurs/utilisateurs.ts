import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Utilisateur, UtilisateursService } from '../../../../core/services/utilisateurs';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.scss',
})
export class Utilisateurs implements OnInit {
  items: Utilisateur[] = [];
  modalOpen = false;
  selectedId: number | null = null;

  form: any = this.emptyForm();

  roles = ['ADMIN', 'CAISSIER', 'RESPONSABLE_CAISSE'];

  constructor(
    private service: UtilisateursService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  emptyForm() {
    return {
      nom: '',
      email: '',
      mot_de_passe: '',
      role: 'CAISSIER',
    };
  }

  load() {
    this.service.getAll().subscribe((res) => {
      this.items = res;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.selectedId = null;
    this.form = this.emptyForm();
    this.modalOpen = true;
  }

  openEdit(u: Utilisateur) {
    this.selectedId = u.id;
    this.form = {
      nom: u.nom,
      email: u.email,
      role: u.role,
      mot_de_passe: '',
    };
    this.modalOpen = true;
  }

  save() {
    const req = this.selectedId
      ? this.service.update(this.selectedId, this.form)
      : this.service.create(this.form);

    req.subscribe(() => {
      this.modalOpen = false;
      this.load();
    });
  }

  remove(u: Utilisateur) {
    if (!confirm('Supprimer ?')) return;
    this.service.delete(u.id).subscribe(() => this.load());
  }
}
