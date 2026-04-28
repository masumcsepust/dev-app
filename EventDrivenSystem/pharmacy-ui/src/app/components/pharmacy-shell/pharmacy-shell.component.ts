import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { PharmacyService } from '../../services/pharmacy.service';
import { AuthService } from '../../services/auth.service';
import { PharmacyAiChatComponent } from '../pharmacy-ai-chat/pharmacy-ai-chat.component';

@Component({
  selector: 'app-pharmacy-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, NgIf, PharmacyAiChatComponent],
  templateUrl: './pharmacy-shell.component.html',
  styleUrl: './pharmacy-shell.component.css'
})
export class PharmacyShellComponent {
  cart$ = this.svc.cart$;
  user$ = this.auth.user$;

  constructor(private svc: PharmacyService, public auth: AuthService) {}

  logout(): void { this.auth.logout(); }
}
