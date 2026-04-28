import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pharmacy-cms-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pharmacy-cms-shell.component.html',
  styleUrls: ['./pharmacy-cms-shell.component.css']
})
export class PharmacyCmsShellComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() { this.currentUser = this.authService.currentUserValue; }

  logout() { this.authService.logout(); this.router.navigate(['/login']); }

  get initials(): string {
    const u = this.currentUser;
    if (!u) return '?';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || '?';
  }
}
