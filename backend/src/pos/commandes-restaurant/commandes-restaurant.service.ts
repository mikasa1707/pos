import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
  CommandeRestaurant,
  StatutCommande,
} from './entities/commandes-restaurant.entity';
import {
  CommandeLigne,
  StatutCommandeLigne,
} from './entities/commandes-lignes.entity';

import {
  TableRestaurant,
  StatutTable,
} from '../tables-restaurant/entities/tables-restaurant.entity';

import { FicheTechnique } from '../fiches-techniques/entities/fiches-technique.entity';
import {
  SessionCaisse,
  StatutSessionCaisse,
} from '../sessions-caisse/entities/sessions-caisse.entity';

import { Vente, StatutVente } from '../ventes/entities/vente.entity';
import { VenteLigne } from '../ventes/entities/vente-ligne.entity';
import { Paiement } from '../ventes/entities/paiement.entity';
import {
  ModePaiement,
  ModePaiementDetail,
} from '../ventes/enums/mode-paiement.enum';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommandesRestaurantService {
  constructor(
    private dataSource: DataSource,
    private config: ConfigService,

    @InjectRepository(CommandeRestaurant)
    private commandeRepo: Repository<CommandeRestaurant>,

    @InjectRepository(TableRestaurant)
    private tableRepo: Repository<TableRestaurant>,
  ) {}

  findOuvertes() {
    return this.commandeRepo.find({
      where: [
        { statut: StatutCommande.OUVERTE },
        { statut: StatutCommande.EN_PREPARATION },
        { statut: StatutCommande.SERVIE },
      ],
      relations: {
        table: { zone: true },
        sessionCaisse: true,
        lignes: { ficheTechnique: true },
      },
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.commandeRepo.findOne({
      where: { id },
      relations: {
        table: { zone: true },
        sessionCaisse: true,
        lignes: { ficheTechnique: true },
      },
    });
  }

  async ouvrir(body: {
    table_id?: number | null;
    session_caisse_id: number;
    client?: string;
    commentaire?: string;
  }) {
    return this.dataSource.transaction(async (manager) => {
      let table: TableRestaurant | null = null;

      if (body.table_id) {
        table = await manager.findOne(TableRestaurant, {
          where: { id: body.table_id, actif: true },
        });

        if (!table) {
          throw new NotFoundException('Table introuvable');
        }

        if (table.statut === StatutTable.OCCUPEE) {
          throw new BadRequestException('Cette table est déjà occupée');
        }

        if (table.statut === StatutTable.HORS_SERVICE) {
          throw new BadRequestException('Cette table est hors service');
        }
      }

      const session = await manager.findOne(SessionCaisse, {
        where: {
          id: body.session_caisse_id,
          statut: StatutSessionCaisse.OUVERTE,
        },
      });

      if (!session) {
        throw new BadRequestException('Session caisse non ouverte');
      }

      const commande = manager.create(CommandeRestaurant, {
        reference: this.generateReference(),
        table: table || undefined,
        sessionCaisse: session,
        client:
          body.client || (table ? `Table ${table.nom}` : 'Client sans table'),
        commentaire: body.commentaire || undefined,
        statut: StatutCommande.OUVERTE,
        montant_total: 0,
      });

      if (table) {
        table.statut = StatutTable.OCCUPEE;
        await manager.save(TableRestaurant, table);
      }

      return manager.save(CommandeRestaurant, commande);
    });
  }

  async ajouterLigne(
    commandeId: number,
    body: {
      fiche_technique_id: number;
      quantite: number;
      commentaire?: string;
    },
  ) {
    return this.dataSource.transaction(async (manager) => {
      const commande = await manager.findOne(CommandeRestaurant, {
        where: { id: commandeId },
      });

      if (!commande) {
        throw new NotFoundException('Commande introuvable');
      }

      if (
        ![
          StatutCommande.OUVERTE,
          StatutCommande.EN_PREPARATION,
          StatutCommande.SERVIE,
        ].includes(commande.statut)
      ) {
        throw new BadRequestException('Commande non modifiable');
      }

      const ft = await manager.findOne(FicheTechnique, {
        where: {
          id: body.fiche_technique_id,
          actif: true,
          vendable: true,
        },
      });

      if (!ft) {
        throw new NotFoundException('Produit introuvable ou non vendable');
      }

      const quantite = Number(body.quantite || 1);
      const prix = Number(ft.prix_vente);

      const ligneExistante = await manager.findOne(CommandeLigne, {
        where: {
          commande: { id: commande.id },
          ficheTechnique: { id: ft.id },
          statut: StatutCommandeLigne.EN_ATTENTE,
        },
        relations: {
          commande: true,
          ficheTechnique: true,
        },
      });

      if (ligneExistante) {
        ligneExistante.quantite = Number(ligneExistante.quantite) + quantite;
        ligneExistante.prix_unitaire = prix;
        ligneExistante.montant = Number(ligneExistante.quantite) * prix;

        await manager.save(CommandeLigne, ligneExistante);
      } else {
        const ligne = manager.create(CommandeLigne, {
          commande,
          ficheTechnique: ft,
          quantite,
          prix_unitaire: prix,
          montant: prix * quantite,
          statut: StatutCommandeLigne.EN_ATTENTE,
          commentaire: body.commentaire || undefined,
        });

        await manager.save(CommandeLigne, ligne);
      }

      await this.recalculerTotal(manager, commande.id);

      return manager.findOne(CommandeRestaurant, {
        where: { id: commande.id },
        relations: {
          table: true,
          lignes: { ficheTechnique: true },
        },
      });
    });
  }

  async changerQuantiteLigne(ligneId: number, quantite: number) {
    return this.dataSource.transaction(async (manager) => {
      const ligne = await manager.findOne(CommandeLigne, {
        where: { id: ligneId },
        relations: { commande: true },
      });

      if (!ligne) {
        throw new NotFoundException('Ligne introuvable');
      }

      if (quantite <= 0) {
        await manager.remove(CommandeLigne, ligne);
      } else {
        ligne.quantite = quantite;
        ligne.montant = Number(ligne.prix_unitaire) * Number(quantite);
        await manager.save(CommandeLigne, ligne);
      }

      await this.recalculerTotal(manager, ligne.commande.id);

      return this.findOne(ligne.commande.id);
    });
  }

  async envoyerPreparation(id: number) {
    const commande = await this.commandeRepo.findOne({ where: { id } });

    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }

    commande.statut = StatutCommande.EN_PREPARATION;
    return this.commandeRepo.save(commande);
  }

  async marquerServie(id: number) {
    const commande = await this.commandeRepo.findOne({ where: { id } });

    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }

    commande.statut = StatutCommande.SERVIE;
    return this.commandeRepo.save(commande);
  }

  async transfererTable(id: number, nouvelleTableId: number) {
    return this.dataSource.transaction(async (manager) => {
      const commande = await manager.findOne(CommandeRestaurant, {
        where: { id },
        relations: { table: true },
      });

      if (!commande) throw new NotFoundException('Commande introuvable');

      const nouvelleTable = await manager.findOne(TableRestaurant, {
        where: { id: nouvelleTableId, actif: true },
      });

      if (!nouvelleTable)
        throw new NotFoundException('Nouvelle table introuvable');

      if (nouvelleTable.statut === StatutTable.OCCUPEE) {
        throw new BadRequestException('Nouvelle table déjà occupée');
      }

      const ancienneTable = commande.table;
      if (ancienneTable) {
        ancienneTable.statut = StatutTable.LIBRE;
        await manager.save(TableRestaurant, ancienneTable);
      }
      nouvelleTable.statut = StatutTable.OCCUPEE;

      commande.table = nouvelleTable;

      await manager.save(TableRestaurant, nouvelleTable);

      return manager.save(CommandeRestaurant, commande);
    });
  }

  async fusionner(idSource: number, idCible: number) {
    return this.dataSource.transaction(async (manager) => {
      if (idSource === idCible) {
        throw new BadRequestException(
          'Impossible de fusionner la même commande',
        );
      }

      const source = await manager.findOne(CommandeRestaurant, {
        where: { id: idSource },
        relations: { lignes: true, table: true },
      });

      const cible = await manager.findOne(CommandeRestaurant, {
        where: { id: idCible },
        relations: { lignes: true, table: true },
      });

      if (!source || !cible) {
        throw new NotFoundException('Commande introuvable');
      }

      for (const ligne of source.lignes || []) {
        ligne.commande = cible;
        await manager.save(CommandeLigne, ligne);
      }

      source.statut = StatutCommande.ANNULEE;
      if (source.table) {
        source.table.statut = StatutTable.LIBRE;
        await manager.save(TableRestaurant, source.table);
      }

      await manager.save(CommandeRestaurant, source);
      await this.recalculerTotal(manager, cible.id);

      return manager.findOne(CommandeRestaurant, {
        where: { id: cible.id },
        relations: {
          table: true,
          lignes: { ficheTechnique: true },
        },
      });
    });
  }

  async annuler(id: number, body?: { code_admin?: string }) {
    return this.dataSource.transaction(async (manager) => {
      const commande = await manager.findOne(CommandeRestaurant, {
        where: { id },
        relations: { table: true },
      });

      if (!commande) {
        throw new NotFoundException('Commande introuvable');
      }

      const total = Number(commande.montant_total || 0);

      if (total > 0) {
        const cancelCode = this.config.get<string>('ADMIN_CANCEL_CODE');

        if (!cancelCode || body?.code_admin !== cancelCode) {
          throw new BadRequestException('Code admin invalide');
        }
      }

      commande.statut = StatutCommande.ANNULEE;

      if (commande.table) {
        commande.table.statut = StatutTable.LIBRE;
        await manager.save(TableRestaurant, commande.table);
      }

      return manager.save(CommandeRestaurant, commande);
    });
  }

  async payer(
    id: number,
    body: {
      mode_paiement: ModePaiement;
      montant_paye: number;
      reference_transaction?: string;
    },
  ) {
    return this.dataSource.transaction(async (manager) => {
      const commande = await manager.findOne(CommandeRestaurant, {
        where: { id },
        relations: {
          table: true,
          sessionCaisse: true,
          lignes: { ficheTechnique: true },
        },
      });

      if (!commande) throw new NotFoundException('Commande introuvable');

      if (!commande.lignes?.length) {
        throw new BadRequestException('Commande vide');
      }

      const montantTotal = Number(commande.montant_total);
      const montantPaye = Number(body.montant_paye || 0);

      if (montantPaye < montantTotal) {
        throw new BadRequestException('Montant payé insuffisant');
      }

      if (
        (body.mode_paiement === ModePaiement.MVOLA ||
          body.mode_paiement === ModePaiement.CARTE) &&
        !body.reference_transaction?.trim()
      ) {
        throw new BadRequestException('Référence transaction obligatoire');
      }

      const vente = manager.create(Vente, {
        reference: await this.generateVenteReference(),
        client: commande.client || 'Client table',
        montant_total: montantTotal,
        montant_paye: montantPaye,
        rendu: montantPaye - montantTotal,
        mode_paiement: body.mode_paiement,
        statut: StatutVente.VALIDE,
        sessionCaisse: commande.sessionCaisse,
        commentaire: `Paiement commande ${commande.reference}`,
      });

      const savedVente = await manager.save(Vente, vente);

      const venteLignes = commande.lignes.map((ligne) =>
        manager.create(VenteLigne, {
          vente: savedVente,
          ficheTechnique: ligne.ficheTechnique,
          quantite: Number(ligne.quantite),
          prix_unitaire: Number(ligne.prix_unitaire),
          montant: Number(ligne.montant),
          cout_matiere:
            Number(ligne.ficheTechnique?.cout_matiere || 0) *
            Number(ligne.quantite),
          marge:
            Number(ligne.montant) -
            Number(ligne.ficheTechnique?.cout_matiere || 0) *
              Number(ligne.quantite),
        }),
      );

      await manager.save(VenteLigne, venteLignes);

      await manager.save(
        Paiement,
        manager.create(Paiement, {
          vente: savedVente,
          mode: body.mode_paiement as unknown as ModePaiementDetail,
          montant: montantPaye,
          reference_transaction: body.reference_transaction || undefined,
        }),
      );

      commande.statut = StatutCommande.PAYEE;
      if (commande.table) {
        commande.table.statut = StatutTable.LIBRE;
        await manager.save(TableRestaurant, commande.table);
      }

      await manager.save(CommandeRestaurant, commande);

      return savedVente;
    });
  }

  private async recalculerTotal(manager: any, commandeId: number) {
    const lignes = await manager.find(CommandeLigne, {
      where: { commande: { id: commandeId } },
    });

    const total = lignes
      .filter((l) => l.statut !== StatutCommandeLigne.ANNULEE)
      .reduce((sum, l) => sum + Number(l.montant), 0);

    await manager.update(CommandeRestaurant, commandeId, {
      montant_total: total,
    });
  }

  private generateReference(): string {
    const now = new Date();

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');

    return `CMD-${y}${m}${d}-${Date.now()}`;
  }

  private async generateVenteReference() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `V-${y}${m}${d}-${Date.now()}`;
  }
}
