import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-brand">
          <span class="brand-icon">💊</span>
          <span class="brand-text">Pharma<span>Store</span></span>
        </div>

        <div class="tab-switch">
          <button [class.active]="tab()==='login'" (click)="tab.set('login')">Sign In</button>
          <button [class.active]="tab()==='register'" (click)="tab.set('register')">Register</button>
        </div>

        <!-- Login -->
        <form *ngIf="tab()==='login'" (ngSubmit)="login()" #lf="ngForm">
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="you@email.com">
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••">
          </div>
          <p class="error" *ngIf="error()">{{ error() }}</p>
          <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading() || lf.invalid">
            {{ loading() ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <!-- Register -->
        <form *ngIf="tab()==='register'" (ngSubmit)="register()" #rf="ngForm">
          <div class="form-row">
            <div class="field">
              <label>First Name</label>
              <input type="text" [(ngModel)]="firstName" name="firstName" required placeholder="Masum">
            </div>
            <div class="field">
              <label>Last Name</label>
              <input type="text" [(ngModel)]="lastName" name="lastName" required placeholder="Billah">
            </div>
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="you@email.com">
          </div>
          <div class="field">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="phone" name="phone" required placeholder="01XXXXXXXXX">
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6" placeholder="min. 6 characters">
          </div>
          <p class="error" *ngIf="error()">{{ error() }}</p>
          <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading() || rf.invalid">
            {{ loading() ? 'Creating account…' : 'Create Account' }}
          </button>
        </form>

        <p class="back-link"><a routerLink="/">← Back to store</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f4c2a 0%, #1a7a45 100%);
      padding: 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 2rem;
    }
    .auth-brand {
      display: flex;
      align-items: center;
      gap: .6rem;
      font-size: 1.4rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      justify-content: center;
    }
    .brand-icon {
      background: linear-gradient(135deg, #16a34a, #22c55e);
      color: #fff;
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
    }
    .brand-text span { color: var(--primary); }
    .tab-switch {
      display: flex;
      background: var(--gray-100);
      border-radius: var(--radius-lg);
      padding: 3px;
      margin-bottom: 1.5rem;
    }
    .tab-switch button {
      flex: 1;
      padding: .5rem;
      border: none;
      background: transparent;
      border-radius: var(--radius);
      font-weight: 600;
      font-size: .875rem;
      color: var(--muted);
      cursor: pointer;
      transition: all .2s;
    }
    .tab-switch button.active {
      background: #fff;
      color: var(--gray-900);
      box-shadow: 0 1px 4px rgba(0,0,0,.1);
    }
    .field { margin-bottom: .9rem; }
    .field label { display: block; font-size: .82rem; font-weight: 600; color: var(--gray-700); margin-bottom: .3rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .submit-btn { width: 100%; margin-top: .5rem; }
    .error { color: #dc2626; font-size: .82rem; margin: .25rem 0; }
    .back-link { text-align: center; margin-top: 1.25rem; font-size: .82rem; }
    .back-link a { color: var(--primary); text-decoration: none; }
  `]
})
export class LoginComponent {
  tab = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');

  email = ''; password = ''; firstName = ''; lastName = ''; phone = '';

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/']);
  }

  login(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => { this.error.set(e?.error?.message || 'Invalid email or password'); this.loading.set(false); }
    });
  }

  register(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.register({ firstName: this.firstName, lastName: this.lastName, email: this.email, phoneNumber: this.phone, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => { this.error.set(e?.error?.message || 'Registration failed'); this.loading.set(false); }
    });
  }
}
