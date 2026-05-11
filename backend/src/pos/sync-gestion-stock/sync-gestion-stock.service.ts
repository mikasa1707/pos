import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { SessionCaisse } from '../sessions-caisse/entities/sessions-caisse.entity';
import { Vente } from '../ventes/entities/vente.entity';

@Injectable()
export class SyncGestionStockService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(SessionCaisse)
    private sessionRepo: Repository<SessionCaisse>,

    @InjectRepository(Vente)
    private venteRepo: Repository<Vente>,
  ) {}

  async syncSession(sessionId: number) {
    console.log('SYNC SESSION GESTION STOCK =>', sessionId);

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session introuvable');
    }

    // éviter double sync
    if ((session as any).synced_gestion_stock) {
      console.log('Session déjà synchronisée');
      return;
    }

    // récupérer ventes POS
    const ventes = await this.venteRepo.find({
      where: {
        sessionCaisse: {
          id: sessionId,
        },
      },

      relations: {
        lignes: {
          ficheTechnique: true,
        },

        paiements: true,
      },
    });

    console.log(`${ventes.length} ventes trouvées`);

    // connexion DB gestion_stock
    const gestionStockDb = new DataSource({
      type: 'mysql',

      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'gestion_stock',
    });

    await gestionStockDb.initialize();

    try {
      for (const vente of ventes) {
        // éviter doublon
        const existing = await gestionStockDb.query(
          `
          SELECT id
          FROM ventes
          WHERE reference = ?
          LIMIT 1
          `,
          [vente.reference],
        );

        if (existing.length) {
          console.log('VENTE EXISTE DEJA =>', vente.reference);
          continue;
        }

        const coutMatiereTotal = (vente.lignes || []).reduce(
          (sum, ligne) => sum + Number(ligne.cout_matiere || 0),
          0,
        );

        const margeTotal = (vente.lignes || []).reduce(
          (sum, ligne) => sum + Number(ligne.marge || 0),
          0,
        );

        // INSERT vente
        const venteInsert: any = await gestionStockDb.query(
          `
          INSERT INTO ventes
          (
            reference,
            client,
            createdAt,
            date,
            montantTotal,
            commentaire,
            coutMatiere,
            marge
          )
          VALUES
          (?, ?, NOW(), NOW(), ?, ?, ?, ?)
          `,
          [
            vente.reference,
            vente.client || 'Client comptoir',
            Number(vente.montant_total),
            vente.commentaire || null,
            coutMatiereTotal,
            margeTotal,
          ],
        );

        const venteId = venteInsert.insertId;

        console.log('VENTE INSEREE =>', vente.reference);

        // INSERT lignes
        for (const ligne of vente.lignes || []) {
          // chercher FT par référence
          const ft = await gestionStockDb.query(
            `
            SELECT id
            FROM fiches_techniques
            WHERE REPLACE(UPPER(reference), '-', '') = ?
            LIMIT 1
            `,
            [this.normalizeReference(ligne.ficheTechnique?.reference)],
          );

          if (!ft.length) {
            console.log('FT INTROUVABLE =>', ligne.ficheTechnique?.reference);

            continue;
          }

          const ftId = ft[0].id;

          await gestionStockDb.query(
            `
            INSERT INTO vente_lignes
            (
              quantite,
              prixUnitaire,
              montant,
              vente_id,
              fiche_technique_id,
              coutMatiere,
              marge
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
            `,
            [
              Number(ligne.quantite),
              Number(ligne.prix_unitaire),
              Number(ligne.montant),
              venteId,
              ftId,
              Number(ligne.cout_matiere || 0),
              Number(ligne.marge || 0),
            ],
          );
        }
      }

      // marquer session sync
      await this.sessionRepo.update(session.id, {
        synced_gestion_stock: true as any,
        synced_at: new Date() as any,
      });

      console.log('SYNC TERMINEE');
    } finally {
      await gestionStockDb.destroy();
    }
  }

  private normalizeReference(ref?: string): string {
    if (!ref) return '';

    return ref.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
}
