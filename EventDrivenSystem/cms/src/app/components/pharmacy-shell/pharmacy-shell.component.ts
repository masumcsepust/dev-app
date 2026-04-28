import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PharmacyService } from '../../services/pharmacy.service';
import { PharmacyAiChatComponent } from '../pharmacy-ai-chat/pharmacy-ai-chat.component';

@Component({
  selector: 'app-pharmacy-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, PharmacyAiChatComponent],
  templateUrl: './pharmacy-shell.component.html',
  styleUrls: ['./pharmacy-shell.component.css']
})
export class PharmacyShellComponent implements OnInit {
  cartCount = 0;
  mobileMenuOpen = false;

  constructor(public pharmacyService: PharmacyService) {}

  ngOnInit() {
    this.pharmacyService.cart$.subscribe(items => {
      this.cartCount = items.reduce((s, i) => s + i.quantity, 0);
    });
  }
}
