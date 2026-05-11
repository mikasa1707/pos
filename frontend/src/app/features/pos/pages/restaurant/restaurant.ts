import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  TableRestaurant,
  TablesRestaurantService,
} from '../../../../core/services/tables-restaurant';

import {
  FicheTechnique,
  FichesTechniquesService,
} from '../../../../core/services/fiches-techniques';

import { CommandesRestaurantService } from '../../../../core/services/commandes-restaurant';
import { AuthService } from '../../../../core/services/auth';
import { SessionsCaisseService, SessionCaisse } from '../../../../core/services/sessions-caisse';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant.html',
  styleUrl: './restaurant.scss',
})
export class Restaurant implements OnInit {
  tables: TableRestaurant[] = [];
  produits: FicheTechnique[] = [];
  commandesOuvertes: any[] = [];

  session: SessionCaisse | null = null;

  selectedTable: TableRestaurant | null = null;
  selectedCommande: any = null;

  search = '';
  modePaiement: 'ESPECE' | 'MVOLA' | 'CARTE' = 'ESPECE';
  montantPaye = 0;
  referenceTransaction = '';

  paymentModalOpen = false;

  constructor(
    private tablesService: TablesRestaurantService,
    private ftService: FichesTechniquesService,
    private commandesService: CommandesRestaurantService,
    private auth: AuthService,
    private sessionsService: SessionsCaisseService,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.tablesService.getAll().subscribe((res) => (this.tables = res));
    this.ftService.getAll().subscribe((res) => (this.produits = res));
    this.commandesService.getOuvertes().subscribe((res) => (this.commandesOuvertes = res));

    const user = this.auth.getUser();
    if (user) {
      this.sessionsService.getOuverte(user.id).subscribe((session) => {
        this.session = session;
      });
    }
  }

  get zones(): string[] {
    const zones = this.tables
      .map((t) => t.zone?.nom || 'Sans zone')
      .filter((v, i, arr) => arr.indexOf(v) === i);

    return zones;
  }

  tablesByZone(zone: string): TableRestaurant[] {
    return this.tables.filter((t) => (t.zone?.nom || 'Sans zone') === zone);
  }

  get produitsFiltres(): FicheTechnique[] {
    const s = this.search.toLowerCase();

    return this.produits.filter((p) =>
      p.nom.toLowerCase().includes(s) ||
      p.reference.toLowerCase().includes(s)
    );
  }

  get totalCommande(): number {
    return Number(this.selectedCommande?.montant_total || 0);
  }

  get rendu(): number {
    return Math.max(Number(this.montantPaye || 0) - this.totalCommande, 0);
  }

  commandePourTable(table: TableRestaurant): any {
    return this.commandesOuvertes.find((c) => c.table?.id === table.id);
  }

  ouvrirTable(table: TableRestaurant): void {
    if (!this.session) {
      alert('Veuillez ouvrir une session caisse avant de prendre une commande.');
      return;
    }

    this.selectedTable = table;

    const exist = this.commandePourTable(table);
    if (exist) {
      this.selectedCommande = exist;
      return;
    }

    this.commandesService
      .ouvrir({
        table_id: table.id,
        session_caisse_id: this.session.id,
        client: `Table ${table.nom}`,
      })
      .subscribe({
        next: (commande) => {
          this.selectedCommande = commande;
          this.loadAll();
        },
        error: (err) => alert(err.error?.message || 'Erreur ouverture commande'),
      });
  }

  ajouterProduit(produit: FicheTechnique): void {
    if (!this.selectedCommande) return;

    this.commandesService
      .ajouterLigne(this.selectedCommande.id, {
        fiche_technique_id: produit.id,
        quantite: 1,
      })
      .subscribe((commande) => {
        this.selectedCommande = commande;
        this.loadAll();
      });
  }

  plus(ligne: any): void {
    this.commandesService
      .changerQuantiteLigne(ligne.id, Number(ligne.quantite) + 1)
      .subscribe((commande) => {
        this.selectedCommande = commande;
        this.loadAll();
      });
  }

  moins(ligne: any): void {
    this.commandesService
      .changerQuantiteLigne(ligne.id, Number(ligne.quantite) - 1)
      .subscribe((commande) => {
        this.selectedCommande = commande;
        this.loadAll();
      });
  }

  envoyerCuisine(): void {
    if (!this.selectedCommande) return;

    this.commandesService.envoyerPreparation(this.selectedCommande.id).subscribe(() => {
      this.loadAll();
      alert('Commande envoyée en préparation');
    });
  }

  marquerServie(): void {
    if (!this.selectedCommande) return;

    this.commandesService.marquerServie(this.selectedCommande.id).subscribe(() => {
      this.loadAll();
      alert('Commande servie');
    });
  }

  annulerCommande(): void {
    if (!this.selectedCommande) return;
    if (!confirm('Annuler cette commande ?')) return;

    this.commandesService.annuler(this.selectedCommande.id).subscribe(() => {
      this.selectedCommande = null;
      this.selectedTable = null;
      this.loadAll();
    });
  }

  ouvrirPaiement(): void {
    if (!this.selectedCommande) return;

    this.montantPaye = this.totalCommande;
    this.paymentModalOpen = true;
  }

  payerCommande(): void {
    if (!this.selectedCommande) return;

    if (this.montantPaye < this.totalCommande) {
      alert('Montant insuffisant');
      return;
    }

    if (
      (this.modePaiement === 'MVOLA' || this.modePaiement === 'CARTE') &&
      !this.referenceTransaction.trim()
    ) {
      alert('Référence transaction obligatoire');
      return;
    }

    this.commandesService
      .payer(this.selectedCommande.id, {
        mode_paiement: this.modePaiement,
        montant_paye: this.montantPaye,
        reference_transaction:
          this.modePaiement === 'MVOLA' || this.modePaiement === 'CARTE'
            ? this.referenceTransaction
            : undefined,
      })
      .subscribe({
        next: () => {
          alert('Commande payée');
          this.paymentModalOpen = false;
          this.selectedCommande = null;
          this.selectedTable = null;
          this.loadAll();
        },
        error: (err) => alert(err.error?.message || 'Erreur paiement'),
      });
  }
}