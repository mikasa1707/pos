import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VentesService } from '../../../../core/services/ventes';

@Component({
  selector: 'app-dashboard-ventes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-ventes.html',
  styleUrl: './dashboard-ventes.scss',
})
export class DashboardVentes implements OnInit {
  data: any;
  loading = false;

  constructor(
    private ventesService: VentesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.ventesService.getDashboard().subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }
}
