import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  SessionCaisse,
  StatutSessionCaisse,
} from './entities/sessions-caisse.entity';
import { Utilisateur } from '../utilisateurs/entities/utilisateur.entity';
import { Vente, StatutVente } from '../ventes/entities/vente.entity';
import * as ExcelJS from 'exceljs';
import { SyncGestionStockService } from '../sync-gestion-stock/sync-gestion-stock.service';

@Injectable()
export class SessionsCaisseService {
  constructor(
    private dataSource: DataSource,
    private syncGestionStockService: SyncGestionStockService,

    @InjectRepository(SessionCaisse)
    private repo: Repository<SessionCaisse>,
  ) {}

  async getOuverte(utilisateurId: number) {
    return this.repo.findOne({
      where: {
        utilisateur: { id: utilisateurId },
        statut: StatutSessionCaisse.OUVERTE,
      },
      relations: {
        utilisateur: true,
      },
    });
  }

  async ouvrir(body: {
    utilisateur_id: number;
    fond_caisse: number;
    poste_caisse_id: number;
  }) {
    // 🔴 1. Vérifier session déjà ouverte pour utilisateur
    const existUser = await this.getOuverte(body.utilisateur_id);

    if (existUser) {
      throw new BadRequestException(
        'Une session est déjà ouverte pour cet utilisateur',
      );
    }

    // 🔴 2. Vérifier session déjà ouverte pour ce poste (BAR / SDT)
    const sessionPoste = await this.repo.findOne({
      where: {
        posteCaisse: { id: body.poste_caisse_id },
        statut: StatutSessionCaisse.OUVERTE,
      },
    });

    if (sessionPoste) {
      throw new BadRequestException(
        'Ce poste de caisse a déjà une session ouverte',
      );
    }

    // ✅ Création session
    const session = this.repo.create({
      utilisateur: { id: body.utilisateur_id },
      posteCaisse: { id: body.poste_caisse_id },
      fond_caisse: Number(body.fond_caisse || 0),
      statut: StatutSessionCaisse.OUVERTE,
    });

    return this.repo.save(session);
  }

  async cloturer(
    id: number,
    body: { montant_reel: number; commentaire?: string },
  ) {
    return this.dataSource.transaction(async (manager) => {
      const session = await manager.findOne(SessionCaisse, {
        where: { id },
        relations: { utilisateur: true },
      });

      if (!session) {
        throw new NotFoundException('Session caisse introuvable');
      }

      if (session.statut === StatutSessionCaisse.CLOTUREE) {
        throw new BadRequestException('Session déjà clôturée');
      }

      const ventes = await manager.find(Vente, {
        where: {
          sessionCaisse: { id: session.id },
          statut: StatutVente.VALIDE,
        },
        relations: {
          paiements: true,
        },
      });

      const totalVentes = ventes.reduce(
        (sum, v) => sum + Number(v.montant_total),
        0,
      );

      const paiements = ventes.flatMap((v) => v.paiements || []);

      const totalEspece = paiements
        .filter((p) => p.mode === 'ESPECE')
        .reduce((sum, p) => sum + Number(p.montant), 0);

      const totalMvola = paiements
        .filter((p) => p.mode === 'MVOLA')
        .reduce((sum, p) => sum + Number(p.montant), 0);

      const totalCarte = paiements
        .filter((p) => p.mode === 'CARTE')
        .reduce((sum, p) => sum + Number(p.montant), 0);

      const totalAttendu = Number(session.fond_caisse) + totalEspece;
      const montantReel = Number(body.montant_reel || 0);
      const ecart = montantReel - totalAttendu;

      session.total_ventes = totalVentes;
      session.total_espece = totalEspece;
      session.total_mvola = totalMvola;
      session.total_carte = totalCarte;
      session.total_attendu = totalAttendu;
      session.montant_reel = montantReel;
      session.ecart = ecart;
      session.date_cloture = new Date();
      session.statut = StatutSessionCaisse.CLOTUREE;
      session.commentaire = body.commentaire || undefined;

      const savedSession = await this.dataSource.transaction(
        async (manager) => {
          // tout ton code actuel...

          const saved = await manager.save(SessionCaisse, session);
          return saved;
        },
      );

      await this.syncGestionStockService.syncSession(savedSession.id);

      return savedSession;
    });
  }

  findAll() {
    return this.repo.find({
      relations: { utilisateur: true },
      order: { date_ouverture: 'DESC' },
    });
  }

  async getDerniereCloture(utilisateurId: number) {
    return this.repo.findOne({
      where: {
        utilisateur: { id: utilisateurId },
        statut: StatutSessionCaisse.CLOTUREE,
      },
      order: {
        date_cloture: 'DESC',
      },
    });
  }

  async rapport(id: number) {
    const session = await this.repo.findOne({
      where: { id },
      relations: {
        utilisateur: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session caisse introuvable');
    }

    const ventes = await this.dataSource.getRepository(Vente).find({
      where: {
        sessionCaisse: { id: session.id },
      },
      relations: {
        lignes: {
          ficheTechnique: true,
        },
        paiements: true,
      },
      order: {
        created_at: 'ASC',
      },
    });

    const ventesValides = ventes.filter((v) => v.statut === StatutVente.VALIDE);
    const ventesAnnulees = ventes.filter(
      (v) => v.statut === StatutVente.ANNULE,
    );

    const totalVentes = ventesValides.reduce(
      (sum, v) => sum + Number(v.montant_total),
      0,
    );

    const paiements = ventesValides.flatMap((v) => v.paiements || []);

    const totalEspece = paiements
      .filter((p) => p.mode === 'ESPECE')
      .reduce((sum, p) => sum + Number(p.montant), 0);

    const totalMvola = paiements
      .filter((p) => p.mode === 'MVOLA')
      .reduce((sum, p) => sum + Number(p.montant), 0);

    const totalCarte = paiements
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
            marge: 0,
          });
        }

        const item = produitsMap.get(nom);
        item.quantite += Number(ligne.quantite);
        item.chiffre += Number(ligne.montant);
        item.marge += Number(ligne.marge);
      }
    }

    const produits = Array.from(produitsMap.values()).sort(
      (a, b) => b.chiffre - a.chiffre,
    );

    return {
      session,
      resume: {
        total_tickets: ventesValides.length,
        ventes_annulees: ventesAnnulees.length,
        total_ventes: totalVentes,
        total_espece: totalEspece,
        total_mvola: totalMvola,
        total_carte: totalCarte,
        fond_caisse: Number(session.fond_caisse),
        total_attendu: Number(session.fond_caisse) + totalEspece,
        montant_reel: Number(session.montant_reel),
        ecart: Number(session.ecart),
      },
      ventes,
      produits,
    };
  }

  async rapportExcel(id: number) {
    const data = await this.rapport(id);

    const workbook = new ExcelJS.Workbook();

    const resumeSheet = workbook.addWorksheet('Résumé');
    resumeSheet.columns = [
      { header: 'Champ', key: 'champ', width: 30 },
      { header: 'Valeur', key: 'valeur', width: 25 },
    ];

    resumeSheet.addRows([
      { champ: 'Session', valeur: data.session.id },
      { champ: 'Caissier', valeur: data.session.utilisateur?.nom || '-' },
      { champ: 'Date ouverture', valeur: data.session.date_ouverture },
      { champ: 'Date clôture', valeur: data.session.date_cloture || '-' },
      { champ: 'Fond caisse', valeur: data.resume.fond_caisse },
      { champ: 'Total ventes', valeur: data.resume.total_ventes },
      { champ: 'Total espèces', valeur: data.resume.total_espece },
      { champ: 'Total MVola', valeur: data.resume.total_mvola },
      { champ: 'Total carte', valeur: data.resume.total_carte },
      { champ: 'Total attendu', valeur: data.resume.total_attendu },
      { champ: 'Montant réel', valeur: data.resume.montant_reel },
      { champ: 'Écart', valeur: data.resume.ecart },
    ]);

    const ventesSheet = workbook.addWorksheet('Ventes');
    ventesSheet.columns = [
      { header: 'Référence', key: 'reference', width: 22 },
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Client', key: 'client', width: 22 },
      { header: 'Paiement', key: 'mode', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Payé', key: 'paye', width: 15 },
      { header: 'Rendu', key: 'rendu', width: 15 },
      { header: 'Statut', key: 'statut', width: 15 },
    ];

    ventesSheet.addRows(
      data.ventes.map((v) => ({
        reference: v.reference,
        date: v.created_at,
        client: v.client,
        mode: v.mode_paiement,
        total: Number(v.montant_total),
        paye: Number(v.montant_paye),
        rendu: Number(v.rendu),
        statut: v.statut,
      })),
    );

    const produitsSheet = workbook.addWorksheet('Produits');
    produitsSheet.columns = [
      { header: 'Produit', key: 'produit', width: 35 },
      { header: 'Quantité', key: 'quantite', width: 15 },
      { header: 'Chiffre', key: 'chiffre', width: 15 },
      { header: 'Marge', key: 'marge', width: 15 },
    ];

    produitsSheet.addRows(data.produits);

    workbook.eachSheet((sheet) => {
      sheet.getRow(1).font = { bold: true };
    });

    return workbook.xlsx.writeBuffer();
  }
}
