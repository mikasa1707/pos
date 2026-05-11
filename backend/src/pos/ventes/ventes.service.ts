import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateVenteDto } from './dto/create-vente.dto';
import { Vente, StatutVente } from './entities/vente.entity';
import { ModePaiement } from './enums/mode-paiement.enum';
import { VenteLigne } from './entities/vente-ligne.entity';
import { Paiement } from './entities/paiement.entity';
import { FicheTechnique } from '../fiches-techniques/entities/fiches-technique.entity';
import {
  SessionCaisse,
  StatutSessionCaisse,
} from '../sessions-caisse/entities/sessions-caisse.entity';

@Injectable()
export class VentesService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Vente)
    private venteRepo: Repository<Vente>,

    @InjectRepository(FicheTechnique)
    private ftRepo: Repository<FicheTechnique>,
  ) {}

  async create(dto: CreateVenteDto) {
    if (!dto.lignes?.length) {
      throw new BadRequestException(
        'La vente doit contenir au moins une ligne',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const reference = await this.generateReference();

      let montantTotal = 0;
      const lignesToSave: VenteLigne[] = [];

      for (const ligneDto of dto.lignes) {
        const ft = await manager.findOne(FicheTechnique, {
          where: {
            id: ligneDto.fiche_technique_id,
            actif: true,
            vendable: true,
          },
        });

        if (!ft) {
          throw new NotFoundException(
            `Produit introuvable ou non vendable: ${ligneDto.fiche_technique_id}`,
          );
        }

        const prix = Number(ft.prix_vente);
        const cout = Number(ft.cout_matiere || 0);
        const quantite = Number(ligneDto.quantite);

        const montant = prix * quantite;
        const coutMatiere = cout * quantite;
        const marge = montant - coutMatiere;

        montantTotal += montant;

        const ligne = manager.create(VenteLigne, {
          ficheTechnique: ft,
          quantite,
          prix_unitaire: prix,
          montant,
          cout_matiere: coutMatiere,
          marge,
        });

        lignesToSave.push(ligne);
      }

      const montantPaye = Number(dto.montant_paye);

      if (montantPaye < montantTotal) {
        throw new BadRequestException('Montant payé insuffisant');
      }

      const paiementsDto = dto.paiements?.length
        ? dto.paiements
        : [
            {
              mode: dto.mode_paiement,
              montant: montantPaye,
              reference_transaction: undefined,
            },
          ];

      for (const p of paiementsDto) {
        if (
          (p.mode === 'MVOLA' || p.mode === 'CARTE') &&
          !p.reference_transaction?.trim()
        ) {
          throw new BadRequestException(
            'Référence transaction obligatoire pour MVOLA ou CARTE',
          );
        }
      }

      const totalPaiements = paiementsDto.reduce(
        (sum, p) => sum + Number(p.montant),
        0,
      );

      if (totalPaiements < montantTotal) {
        throw new BadRequestException('Total paiement insuffisant');
      }

      const rendu = totalPaiements - montantTotal;

      const session = await manager.findOne(SessionCaisse, {
        where: {
          id: dto.session_caisse_id,
          statut: StatutSessionCaisse.OUVERTE,
        },
      });

      if (!session) {
        throw new BadRequestException('Aucune session caisse ouverte');
      }

      const vente = manager.create(Vente, {
        reference,
        client: dto.client || 'Client comptoir',
        commentaire: dto.commentaire || undefined,
        montant_total: montantTotal,
        montant_paye: totalPaiements,
        rendu,
        mode_paiement: dto.mode_paiement,
        statut: StatutVente.VALIDE,
        sessionCaisse: session,
      });

      const savedVente = await manager.save(Vente, vente);

      for (const ligne of lignesToSave) {
        ligne.vente = savedVente;
      }

      await manager.save(VenteLigne, lignesToSave);

      const paiements = paiementsDto.map((p) =>
        manager.create(Paiement, {
          vente: savedVente,
          mode: p.mode,
          montant: Number(p.montant),
          reference_transaction: p.reference_transaction?.trim() || undefined,
        }),
      );

      await manager.save(Paiement, paiements);

      return manager.findOne(Vente, {
        where: { id: savedVente.id },
        relations: {
          lignes: {
            ficheTechnique: true,
          },
          paiements: true,
        },
      });
    });
  }

  findAll() {
    return this.venteRepo.find({
      relations: {
        lignes: {
          ficheTechnique: true,
        },
        paiements: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID invalide');
    }

    const vente = await this.venteRepo.findOne({
      where: { id },
      relations: {
        lignes: {
          ficheTechnique: true,
        },
        paiements: true,
      },
    });

    if (!vente) {
      throw new NotFoundException('Vente introuvable');
    }

    return vente;
  }

  async annuler(id: number, commentaire?: string) {
    const vente = await this.findOne(id);

    if (vente.statut === StatutVente.ANNULE) {
      throw new BadRequestException('Vente déjà annulée');
    }

    vente.statut = StatutVente.ANNULE;
    vente.commentaire = commentaire || 'Vente annulée';

    return this.venteRepo.save(vente);
  }

  private async generateReference(): Promise<string> {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    const count = await this.venteRepo.count();

    return `V-${y}${m}${d}-${String(count + 1).padStart(5, '0')}`;
  }

  async dashboard() {
    const ventes = await this.venteRepo.find({
      relations: {
        lignes: {
          ficheTechnique: true,
        },
        paiements: true,
      },
      order: {
        created_at: 'DESC',
      },
    });

    const ventesValides = ventes.filter((v) => v.statut === StatutVente.VALIDE);

    const totalVentes = ventesValides.reduce(
      (sum, v) => sum + Number(v.montant_total),
      0,
    );

    const totalTickets = ventesValides.length;

    const totalEspece = ventesValides
      .flatMap((v) => v.paiements || [])
      .filter((p) => p.mode === 'ESPECE')
      .reduce((sum, p) => sum + Number(p.montant), 0);

    const totalMvola = ventesValides
      .flatMap((v) => v.paiements || [])
      .filter((p) => p.mode === 'MVOLA')
      .reduce((sum, p) => sum + Number(p.montant), 0);

    const totalCarte = ventesValides
      .flatMap((v) => v.paiements || [])
      .filter((p) => p.mode === 'CARTE')
      .reduce((sum, p) => sum + Number(p.montant), 0);

    const produitsMap = new Map<string, any>();

    for (const vente of ventesValides) {
      for (const ligne of vente.lignes || []) {
        const nom = ligne.ficheTechnique?.nom || 'Produit inconnu';

        if (!produitsMap.has(nom)) {
          produitsMap.set(nom, {
            produit: nom,
            quantite: 0,
            chiffre: 0,
          });
        }

        const item = produitsMap.get(nom);
        item.quantite += Number(ligne.quantite);
        item.chiffre += Number(ligne.montant);
      }
    }

    const topProduits = Array.from(produitsMap.values())
      .sort((a, b) => b.chiffre - a.chiffre)
      .slice(0, 10);

    return {
      totalVentes,
      totalTickets,
      totalEspece,
      totalMvola,
      totalCarte,
      topProduits,
      dernieresVentes: ventes.slice(0, 10),
    };
  }

  async historique(filters: { session_caisse_id?: number; date?: string }) {
    const qb = this.venteRepo
      .createQueryBuilder('vente')
      .leftJoinAndSelect('vente.lignes', 'lignes')
      .leftJoinAndSelect('lignes.ficheTechnique', 'ficheTechnique')
      .leftJoinAndSelect('vente.paiements', 'paiements')
      .leftJoinAndSelect('vente.sessionCaisse', 'sessionCaisse')
      .orderBy('vente.created_at', 'DESC');

    if (filters.session_caisse_id) {
      qb.andWhere('sessionCaisse.id = :sessionId', {
        sessionId: filters.session_caisse_id,
      });
    }

    if (filters.date) {
      qb.andWhere('DATE(vente.created_at) = :date', {
        date: filters.date,
      });
    }

    return qb.getMany();
  }
}
