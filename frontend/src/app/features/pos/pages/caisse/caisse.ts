import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import QRCode from 'qrcode';

import {
  FichesTechniquesService,
  FicheTechnique,
} from '../../../../core/services/fiches-techniques';

import { VentesService } from '../../../../core/services/ventes';
import { Vente } from '../../../../core/models/vente.model';

import { AuthService } from '../../../../core/services/auth';
import { SessionCaisse, SessionsCaisseService } from '../../../../core/services/sessions-caisse';

import { TablesRestaurantService } from '../../../../core/services/tables-restaurant';
import { CommandesRestaurantService } from '../../../../core/services/commandes-restaurant';

type LignePanier = {
  id: number;
  commandeLigneId?: number;
  nom: string;
  categorie: string;
  prix: number;
  coutMatiere: number;
  quantite: number;
  montant: number;
  marge: number;
};

@Component({
  selector: 'app-caisse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caisse.html',
  styleUrl: './caisse.scss',
})
export class Caisse implements OnInit {
  search = '';
  categorieActive = 'TOUS';

  ticketQrCode = '';

  montantPaye = 0;
  referenceTransaction = '';
  modePaiement: 'ESPECE' | 'MVOLA' | 'CARTE' = 'ESPECE';

  sessionCaisse: SessionCaisse | null = null;
  sessionModalOpen = false;
  fondCaisse = 0;
  posteCaisseId = 1;

  loading = false;
  saving = false;

  keyboardOpen = false;
  paymentModalOpen = false;
  ticketModalOpen = false;

  tableModalOpen = false;
  tableModalMode: 'ATTACHER' | 'REPRENDRE' | 'NOUVELLE' = 'ATTACHER';

  produits: FicheTechnique[] = [];
  panier: LignePanier[] = [];

  lastVente: Vente | null = null;

  selectedTable: any = null;
  selectedCommande: any = null;
  tables: any[] = [];
  commandesOuvertes: any[] = [];

  keyboardRows = [
    ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    ['W', 'X', 'C', 'V', 'B', 'N', '0', '1', '2', '3'],
    ['4', '5', '6', '7', '8', '9'],
  ];

  constructor(
    private ftService: FichesTechniquesService,
    private ventesService: VentesService,
    private auth: AuthService,
    private sessionsService: SessionsCaisseService,
    private tablesService: TablesRestaurantService,
    private commandesService: CommandesRestaurantService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProduits();
    this.checkSessionCaisse();
    this.loadRestaurantData();
  }

  checkSessionCaisse(): void {
    const user = this.auth.getUser();
    if (!user) return;

    this.sessionsService.getOuverte(user.id).subscribe({
      next: (session) => {
        this.sessionCaisse = session;

        if (!session) {
          this.sessionModalOpen = true;
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.sessionModalOpen = true;
        this.cdr.detectChanges();
      },
    });

    this.sessionsService.getDerniereCloture(user.id).subscribe((last) => {
      if (last) {
        this.fondCaisse = last.montant_reel;
        this.cdr.detectChanges();
      }
    });
  }

  ouvrirSession(): void {
    const user = this.auth.getUser();
    if (!user) return;

    this.sessionsService
      .ouvrir({
        utilisateur_id: user.id,
        fond_caisse: Number(this.fondCaisse || 0),
        poste_caisse_id: this.posteCaisseId,
      })
      .subscribe({
        next: (session) => {
          this.sessionCaisse = session;
          this.sessionModalOpen = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur ouverture session');
        },
      });
  }

  loadProduits(): void {
    this.loading = true;

    this.ftService.getAll().subscribe({
      next: (data) => {
        this.produits = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur produits:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  ligneKey(ligne: LignePanier): string {
    return `${ligne.commandeLigneId || 0}-${ligne.id}-${ligne.nom}`;
  }

  loadRestaurantData(): void {
    this.tablesService.getAll().subscribe({
      next: (tables) => {
        console.log('TABLES API:', tables);
        this.tables = tables;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur tables:', err);
      },
    });

    this.commandesService.getOuvertes().subscribe({
      next: (commandes) => {
        console.log('COMMANDES OUVERTES:', commandes);
        this.commandesOuvertes = commandes;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur commandes:', err);
      },
    });
  }

  get categories(): string[] {
    const cats = this.produits
      .map((p) => p.categorie?.nom || 'Sans catégorie')
      .filter((v, i, arr) => arr.indexOf(v) === i);

    return ['TOUS', ...cats];
  }

  get produitsFiltres(): FicheTechnique[] {
    return this.produits.filter((p) => {
      const cat = p.categorie?.nom || 'Sans catégorie';
      const search = this.search.toLowerCase();

      return (
        (this.categorieActive === 'TOUS' || cat === this.categorieActive) &&
        (p.nom.toLowerCase().includes(search) || p.reference.toLowerCase().includes(search))
      );
    });
  }

  get total(): number {
    return this.panier.reduce((sum, l) => sum + l.montant, 0);
  }

  get rendu(): number {
    return Math.max(Number(this.montantPaye || 0) - this.total, 0);
  }

  get isCommandeTableActive(): boolean {
    return !!this.selectedCommande;
  }

  get panierTitle(): string {
    if (this.selectedTable && this.selectedCommande) {
      return `Table ${this.selectedTable.nom}`;
    }

    return 'Panier';
  }

  get zones(): string[] {
    return this.tables
      .map((t) => t.zone?.nom || 'Sans zone')
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }

  tablesByZone(zone: string): any[] {
    return this.tables.filter((t) => (t.zone?.nom || 'Sans zone') === zone);
  }

  commandePourTable(table: any): any {
    return this.commandesOuvertes.find((c) => c.table?.id === table.id);
  }

  ajouterProduit(produit: FicheTechnique): void {
    this.paymentModalOpen = false;
    this.keyboardOpen = false;

    if (this.selectedCommande) {
      this.ajouterProduitCommande(produit);
      return;
    }

    this.ajouterProduitPanierLocal(produit);
  }

  ajouterProduitPanierLocal(produit: FicheTechnique): void {
    const ligne = this.panier.find((l) => l.id === produit.id);

    if (ligne) {
      ligne.quantite++;
      this.recalculerLigne(ligne);
      return;
    }

    const prix = Number(produit.prix_vente || 0);
    const cout = Number(produit.cout_matiere || 0);

    this.panier.push({
      id: produit.id,
      nom: produit.nom,
      categorie: produit.categorie?.nom || 'Sans catégorie',
      prix,
      coutMatiere: cout,
      quantite: 1,
      montant: prix,
      marge: prix - cout,
    });
  }

  ajouterProduitCommande(produit: FicheTechnique): void {
    if (!this.selectedCommande) return;

    this.commandesService
      .ajouterLigne(this.selectedCommande.id, {
        fiche_technique_id: produit.id,
        quantite: 1,
      })
      .subscribe({
        next: () => {
          this.reloadCommandeActive();
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur ajout produit table');
        },
      });
  }

  plus(ligne: LignePanier): void {
    if (this.selectedCommande && ligne.commandeLigneId) {
      this.commandesService
        .changerQuantiteLigne(ligne.commandeLigneId, Number(ligne.quantite) + 1)
        .subscribe({
          next: () => {
            this.reloadCommandeActive();
          },
          error: (err) => {
            alert(err.error?.message || 'Erreur quantité');
          },
        });

      return;
    }

    ligne.quantite++;
    this.recalculerLigne(ligne);
  }

  moins(ligne: LignePanier): void {
    if (this.selectedCommande && ligne.commandeLigneId) {
      this.commandesService
        .changerQuantiteLigne(ligne.commandeLigneId, Number(ligne.quantite) - 1)
        .subscribe({
          next: () => {
            this.reloadCommandeActive();
          },
          error: (err) => {
            alert(err.error?.message || 'Erreur quantité');
          },
        });

      return;
    }

    ligne.quantite--;

    if (ligne.quantite <= 0) {
      this.panier = this.panier.filter((l) => l !== ligne);
      return;
    }

    this.recalculerLigne(ligne);
  }

  supprimer(ligne: LignePanier): void {
    if (this.selectedCommande && ligne.commandeLigneId) {
      this.commandesService.changerQuantiteLigne(ligne.commandeLigneId, 0).subscribe({
        next: () => {
          this.reloadCommandeActive();
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur suppression ligne');
        },
      });

      return;
    }

    this.panier = this.panier.filter((l) => l !== ligne);
  }

  viderPanier(): void {
    this.panier = [];
    this.montantPaye = 0;
    this.referenceTransaction = '';
    this.cdr.detectChanges();
  }

  ouvrirSelectionTable(mode: 'ATTACHER' | 'REPRENDRE' | 'NOUVELLE'): void {
    if (!this.sessionCaisse) {
      alert('Veuillez ouvrir une session caisse');
      this.sessionModalOpen = true;
      return;
    }

    this.tableModalMode = mode;
    this.tableModalOpen = true;
    this.loadRestaurantData();
    this.cdr.detectChanges();
  }

  choisirTable(table: any): void {
    const commande = this.commandePourTable(table);

    if (this.tableModalMode === 'REPRENDRE') {
      if (!commande) {
        alert('Aucune commande ouverte sur cette table');
        return;
      }

      this.reprendreCommandeTable(commande);
      this.tableModalOpen = false;
      return;
    }

    if (this.tableModalMode === 'NOUVELLE') {
      if (commande) {
        alert('Cette table a déjà une commande ouverte');
        return;
      }

      this.creerCommandeVide(table);
      return;
    }

    if (this.tableModalMode === 'ATTACHER') {
      if (!this.panier.length) {
        alert('Le panier est vide');
        return;
      }

      if (commande) {
        alert('Cette table est déjà occupée');
        return;
      }

      this.attacherPanierATable(table);
    }
  }

  creerCommandeVide(table: any): void {
    if (!this.sessionCaisse) return;

    this.commandesService
      .ouvrir({
        table_id: table.id,
        session_caisse_id: this.sessionCaisse.id,
        client: `Table ${table.nom}`,
      })
      .subscribe({
        next: (commande) => {
          this.selectedCommande = commande;
          this.selectedTable = null;
          this.syncPanierDepuisCommande(commande);
          this.tableModalOpen = false;
          this.loadRestaurantData();
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur ouverture table');
        },
      });
  }

  attacherPanierATable(table: any): void {
    if (!this.sessionCaisse) return;

    const panierCopie = [...this.panier];

    this.commandesService
      .ouvrir({
        table_id: table.id,
        session_caisse_id: this.sessionCaisse.id,
        client: `Table ${table.nom}`,
      })
      .subscribe({
        next: (commande) => {
          const requests = panierCopie.map((ligne) =>
            this.commandesService.ajouterLigne(commande.id, {
              fiche_technique_id: ligne.id,
              quantite: ligne.quantite,
            }),
          );

          forkJoin(requests).subscribe({
            next: (responses: any[]) => {
              const commandeFinale = responses[responses.length - 1] || commande;

              this.selectedCommande = commandeFinale;
              this.selectedTable = table;
              this.syncPanierDepuisCommande(commandeFinale);

              this.tableModalOpen = false;
              this.loadRestaurantData();
              this.cdr.detectChanges();

              alert(`Panier attaché à ${table.nom}`);
            },
          });
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur attachement table');
        },
      });
  }

  reprendreCommandeTable(commande: any): void {
    this.selectedCommande = commande;
    this.selectedTable = commande.table;
    this.syncPanierDepuisCommande(commande);
    this.loadRestaurantData();
    this.cdr.detectChanges();
  }

  detacherTable(): void {
    this.selectedCommande = null;
    this.selectedTable = null;
    this.viderPanier();
  }

  syncPanierDepuisCommande(commande: any): void {
    this.panier = (commande.lignes || []).map((l: any) => {
      const prix = Number(l.prix_unitaire || 0);
      const quantite = Number(l.quantite || 0);
      const cout = Number(l.ficheTechnique?.cout_matiere || 0);
      const montant = Number(l.montant || prix * quantite);

      return {
        id: l.ficheTechnique.id,
        commandeLigneId: l.id,
        nom: l.ficheTechnique.nom,
        categorie: l.ficheTechnique.categorie?.nom || 'Sans catégorie',
        prix,
        coutMatiere: cout,
        quantite,
        montant,
        marge: montant - cout * quantite,
      };
    });

    this.cdr.detectChanges();
  }

  reloadCommandeActive(): void {
    if (!this.selectedCommande) return;

    this.commandesService.findOne(this.selectedCommande.id).subscribe({
      next: (commande) => {
        this.selectedCommande = commande;
        this.syncPanierDepuisCommande(commande);
        this.loadRestaurantData();
        this.cdr.detectChanges();
      },
    });
  }

  ouvrirPaiement(): void {
    if (!this.panier.length) return;

    this.montantPaye = 0;
    this.referenceTransaction = '';
    this.paymentModalOpen = true;
  }

  validerPaiement(): void {
    if (this.selectedCommande) {
      this.payerCommande();
      return;
    }

    this.validerVente();
  }

  validerVente(): void {
    if (!this.panier.length) return;

    if (!this.sessionCaisse) {
      alert('Veuillez ouvrir une session caisse');
      this.sessionModalOpen = true;
      return;
    }

    if (this.montantPaye < this.total) {
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

    const payload = {
      client: 'Client comptoir',
      mode_paiement: this.modePaiement,
      montant_paye: this.montantPaye,
      session_caisse_id: this.sessionCaisse.id,
      lignes: this.panier.map((l) => ({
        fiche_technique_id: l.id,
        quantite: l.quantite,
      })),
      paiements: [
        {
          mode: this.modePaiement,
          montant: this.montantPaye,
          reference_transaction:
            this.modePaiement === 'MVOLA' || this.modePaiement === 'CARTE'
              ? this.referenceTransaction
              : undefined,
        },
      ],
    };

    this.saving = true;

    this.ventesService.create(payload).subscribe({
      next: async (vente: Vente) => {
        await this.apresPaiementReussi(vente);
      },
      error: (err) => {
        console.error('Erreur création vente', err);
        alert('Erreur lors de la vente');
        this.saving = false;
      },
    });
  }

  payerCommande(): void {
    if (!this.selectedCommande) return;

    if (this.montantPaye < this.total) {
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

    this.saving = true;

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
        next: async (vente: Vente) => {
          this.selectedCommande = null;
          this.selectedTable = null;
          this.loadRestaurantData();
          await this.apresPaiementReussi(vente);
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur paiement');
          this.saving = false;
        },
      });
  }

  async apresPaiementReussi(vente: Vente): Promise<void> {
    this.lastVente = vente;

    this.ticketQrCode = await QRCode.toDataURL(
      `VENTE:${vente.reference}|TOTAL:${vente.montant_total}|DATE:${vente.created_at}`,
    );

    this.ticketModalOpen = true;
    this.paymentModalOpen = false;
    this.saving = false;

    await this.printTicket(vente);

    this.viderPanier();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 300);
  }

  annulerVente(): void {
    this.viderPanier();
    this.paymentModalOpen = false;

    if (this.selectedCommande) {
      this.detacherTable();
    }
  }

  annulerCommandeOuverte(): void {
    if (!this.selectedCommande) return;

    const total = Number(this.selectedCommande.montant_total || this.total || 0);

    let code_admin: string | undefined = undefined;

    if (total > 0) {
      const code = prompt('Commande non vide. Entrez le code admin pour annuler :');

      if (!code) return;

      code_admin = code;
    }

    this.commandesService.annuler(this.selectedCommande.id, { code_admin }).subscribe({
      next: () => {
        this.selectedCommande = null;
        this.selectedTable = null;
        this.viderPanier();
        this.loadRestaurantData();
        alert('Commande annulée');
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur annulation commande');
      },
    });
  }

  imprimerTicket(): void {
    window.print();
    this.cdr.detectChanges();
  }

  fermerTicket(): void {
    this.ticketModalOpen = false;
    this.lastVente = null;
    this.cdr.detectChanges();
  }

  private recalculerLigne(ligne: LignePanier): void {
    ligne.montant = ligne.quantite * ligne.prix;
    ligne.marge = ligne.montant - ligne.coutMatiere * ligne.quantite;
  }

  addMoney(amount: number): void {
    this.montantPaye = Number(this.montantPaye || 0) + amount;
  }

  pressNumber(n: number): void {
    const current = String(this.montantPaye || '');
    this.montantPaye = Number(current + n);
  }

  clearMoney(): void {
    this.montantPaye = 0;
  }

  backspaceMoney(): void {
    const current = String(this.montantPaye || '');
    const next = current.slice(0, -1);
    this.montantPaye = Number(next || 0);
  }

  fermerPaiement(): void {
    this.paymentModalOpen = false;
  }

  openKeyboard(): void {
    this.keyboardOpen = true;
  }

  closeKeyboard(): void {
    this.keyboardOpen = false;
  }

  pressKey(key: string): void {
    this.search = `${this.search}${key}`;
  }

  spaceKey(): void {
    this.search = `${this.search} `;
  }

  backspaceSearch(): void {
    this.search = this.search.slice(0, -1);
  }

  clearSearch(): void {
    this.search = '';
  }

  choisirTableDirect(table: any): void {
    const cmd = this.commandePourTable(table);

    if (cmd) {
      this.reprendreCommandeTable(cmd);
      return;
    }

    if (this.panier.length) {
      if (confirm(`Attacher le panier à ${table.nom} ?`)) {
        this.attacherPanierATable(table);
      }
      return;
    }

    this.creerCommandeVide(table);
  }

  creerCommandeSansTable(): void {
    if (!this.sessionCaisse) {
      alert('Veuillez ouvrir une session caisse');
      this.sessionModalOpen = true;
      return;
    }

    this.commandesService
      .ouvrir({
        table_id: null,
        session_caisse_id: this.sessionCaisse.id,
        client: 'Client sans table',
      })
      .subscribe({
        next: (commande) => {
          this.selectedCommande = commande;
          this.selectedTable = null;
          this.panier = [];
          this.syncPanierDepuisCommande(commande);
          this.loadRestaurantData();
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur création commande');
        },
      });
  }

  commandesSansTable() {
    return this.commandesOuvertes.filter((c) => !c.table);
  }

  async printTicket(vente: any): Promise<void> {
    const qr = await QRCode.toDataURL(`VENTE:${vente.reference}|TOTAL:${vente.montant_total}`);

    const lignes = vente.lignes
      .map(
        (l: any) => `
        <tr>
          <td>${l.ficheTechnique.nom}</td>
          <td>${l.quantite}</td>
          <td>${Number(l.prix_unitaire).toLocaleString()} Ar</td>
          <td>${Number(l.montant).toLocaleString()} Ar</td>
        </tr>
      `,
      )
      .join('');

    const html = `
  <html>
  <head>
    <title>Ticket</title>

    <style>
      body{
        font-family: Arial;
        width:80mm;
        margin:0;
        padding:8px;
        color:#000;
      }

      .center{
        text-align:center;
      }

      .title{
        font-size:18px;
        font-weight:bold;
      }

      .small{
        font-size:11px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:10px;
      }

      td{
        padding:4px 0;
        font-size:12px;
      }

      .total{
        font-size:20px;
        font-weight:bold;
      }

      .separator{
        border-top:1px dashed #000;
        margin:8px 0;
      }

      @media print{
        body{
          width:80mm;
        }
      }
    </style>
  </head>

  <body>

    <div class="center">
      <div class="title">MON RESTAURANT</div>

      <div class="small">
        Ambatoroka - Antananarivo
      </div>

      <div class="small">
        Tel : 034 00 000 00
      </div>

      <div class="separator"></div>

      <div>
        Ticket : ${vente.reference}
      </div>

      <div>
        ${new Date(vente.created_at).toLocaleString()}
      </div>

      <div>
        Caissier : ${vente.utilisateur?.nom || 'N/A'}
      </div>

      ${
        vente.commandeRestaurant?.table?.nom
          ? `<div>Table : ${vente.commandeRestaurant.table.nom}</div>`
          : `<div>Commande rapide</div>`
      }
    </div>

    <div class="separator"></div>

    <table>
      <thead>
        <tr>
          <td><strong>Produit</strong></td>
          <td><strong>Qté</strong></td>
          <td><strong>PU</strong></td>
          <td><strong>Total</strong></td>
        </tr>
      </thead>

      <tbody>
        ${lignes}
      </tbody>
    </table>

    <div class="separator"></div>

    <table>
      <tr>
        <td>Total</td>
        <td align="right" class="total">
          ${Number(vente.montant_total).toLocaleString()} Ar
        </td>
      </tr>

      <tr>
        <td>Payé</td>
        <td align="right">
          ${Number(vente.montant_paye).toLocaleString()} Ar
        </td>
      </tr>

      <tr>
        <td>Rendu</td>
        <td align="right">
          ${Number(vente.rendu).toLocaleString()} Ar
        </td>
      </tr>

      <tr>
        <td>Paiement</td>
        <td align="right">
          ${vente.mode_paiement}
        </td>
      </tr>
    </table>

    <div class="separator"></div>

    <div class="center">
      <img src="${qr}" width="120" />

      <div class="small">
        Merci de votre visite ❤️
      </div>
    </div>

    <script>
      window.onload = () => {
        window.print();

        setTimeout(() => {
          window.close();
        }, 500);
      };
    </script>

  </body>
  </html>
  `;

    const win = window.open('', '_blank', 'width=400,height=800');

    if (!win) return;

    win.document.write(html);
    win.document.close();
  }
}
