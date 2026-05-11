import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';

import { VentesService } from '../../../../core/services/ventes';
import { AuthService } from '../../../../core/services/auth';
import { SessionsCaisseService } from '../../../../core/services/sessions-caisse';

@Component({
  selector: 'app-historique-ventes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique-ventes.html',
  styleUrl: './historique-ventes.scss',
})
export class HistoriqueVentes implements OnInit {
  ventes: any[] = [];
  selectedVente: any = null;
  ticketQrCode = '';

  session: any = null;
  role: string | null = null;

  loading = false;

  constructor(
    private ventesService: VentesService,
    private auth: AuthService,
    private sessionsService: SessionsCaisseService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();

    const user = this.auth.getUser();

    if (this.role === 'CAISSIER') {
      if (!user) {
        this.load();
        return;
      }

      this.sessionsService.getOuverte(user.id).subscribe({
        next: (session) => {
          this.session = session;
          this.load();
        },
        error: () => {
          this.load();
        },
      });

      return;
    }

    // ADMIN / RESPONSABLE_CAISSE
    this.load();
  }

  load(): void {
    this.loading = true;

    const params: any = {};

    if (this.role === 'CAISSIER' && this.session) {
      params.session_caisse_id = this.session.id;
    }

    this.ventesService.historique(params).subscribe({
      next: (res) => {
        this.ventes = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  async voirTicket(vente: any): Promise<void> {
    this.selectedVente = vente;

    this.ticketQrCode = await QRCode.toDataURL(
      `VENTE:${vente.reference}|TOTAL:${vente.montant_total}|DATE:${vente.created_at}`,
    );
  }

  peutImprimer(): boolean {
    if (!this.selectedVente) return false;

    if (this.role === 'ADMIN' || this.role === 'RESPONSABLE_CAISSE') {
      return true;
    }

    return (
      this.role === 'CAISSIER' &&
      this.session &&
      this.selectedVente.sessionCaisse?.id === this.session.id &&
      this.session.statut === 'OUVERTE'
    );
  }

  imprimer(): void {
    if (!this.peutImprimer()) return;
    window.print();
  }

  fermerTicket(): void {
    this.selectedVente = null;
    this.ticketQrCode = '';
  }
}
