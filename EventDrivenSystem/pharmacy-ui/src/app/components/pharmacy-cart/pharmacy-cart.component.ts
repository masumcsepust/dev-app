import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PharmacyService, CartItem } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pharmacy-cart.component.html',
  styleUrl: './pharmacy-cart.component.css'
})
export class PharmacyCartComponent {
  cart$ = this.svc.cart$;

  constructor(private svc: PharmacyService) {}

  get total() { return this.svc.cartTotal; }
  remove(id: number) { this.svc.removeFromCart(id); }
  inc(item: CartItem) { this.svc.updateCartQty(item.medicine.id, item.quantity + 1); }
  dec(item: CartItem) { this.svc.updateCartQty(item.medicine.id, item.quantity - 1); }
  clear() { this.svc.clearCart(); }
}
