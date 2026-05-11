import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { SessionCaisse, SessionsCaisseService } from '../../../../core/services/sessions-caisse';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cloture-caisse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cloture-caisse.html',
  styleUrl: './cloture-caisse.scss',
})
export class ClotureCaisse implements OnInit {
  session: SessionCaisse | null = null;
  montantReel = 0;
  commentaire = '';
  loading = false;
  rapport: any = null;
  posteCaisseId = 1;

  constructor(
    private auth: AuthService,
    private sessionsService: SessionsCaisseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSession();
  }

  loadSession(): void {
    const user = this.auth.getUser();
    if (!user) return;

    this.sessionsService.getOuverte(user.id).subscribe({
      next: (res) => {
        this.session = res;
        this.cdr.detectChanges();
      },
    });
  }

  cloturer(): void {
    if (!this.session) return;

    this.loading = true;

    this.sessionsService
      .cloturer(this.session.id, {
        montant_reel: this.montantReel,
        commentaire: this.commentaire,
      })
      .subscribe({
        next: (res) => {
          this.session = res;
          this.loading = false;
          this.chargerRapport();
          alert('Session clôturée');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          alert(err.error?.message || 'Erreur clôture');
        },
      });
  }

  fondCaisse = 0;
  sessionModalOpen = false;

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
    next: (res) => {
      this.session = res;
      this.sessionModalOpen = false;
        this.cdr.detectChanges();
    },
    error: (err) => {
      alert(err.error?.message || 'Erreur ouverture');
    },
  });
  }

  chargerRapport(): void {
    if (!this.session) return;

    this.sessionsService.rapportJson(this.session.id).subscribe((res) => {
      this.rapport = res;
        this.cdr.detectChanges();
    });
  }

  exportExcel(): void {
    if (!this.session) return;

    this.sessionsService.rapportExcel(this.session.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `rapport-caisse-${this.session?.id}.xlsx`;
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }
}
