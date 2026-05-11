import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  mot_de_passe = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  login() {
    this.error = '';

    if (!this.email || !this.mot_de_passe) {
      this.error = 'Email et mot de passe obligatoires';
      return;
    }

    this.loading = true;

    this.auth.login(this.email, this.mot_de_passe).subscribe({
      next: (res) => {
        this.auth.saveSession(res);
        this.loading = false;
        this.router.navigateByUrl('/pos/caisse');
      },
      error: () => {
        this.error = 'Identifiants incorrects';
        this.loading = false;
      },
    });
  }
}