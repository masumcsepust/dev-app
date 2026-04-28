import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyService, CartItem } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pharmacy-cart.component.html',
  styleUrls: ['./pharmacy-cart.component.css']
})
export class PharmacyCartComponent {
  items: CartItem[] = [];

  constructor(public pharmacyService: PharmacyService) {
    this.pharmacyService.cart$.subscribe(items => this.items = items);
  }

  updateQty(medicineId: number, qty: number) {
    this.pharmacyService.updateCartQty(medicineId, qty);
  }

  remove(medicineId: number) {
    this.pharmacyService.removeFromCart(medicineId);
  }

  clearCart() {
    this.pharmacyService.clearCart();
  }

  get total(): number { return this.pharmacyService.cartTotal; }
}
