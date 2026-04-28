import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AiChatComponent } from '../ai-chat/ai-chat.component';

@Component({
  selector: 'app-customer-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, AiChatComponent],
  templateUrl: './customer-shell.component.html',
  styleUrls: ['./customer-shell.component.css']
})
export class CustomerShellComponent implements OnInit {
  currentUser: any;
  mobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get initials(): string {
    const u = this.currentUser;
    if (!u) return '?';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || '?';
  }
}
