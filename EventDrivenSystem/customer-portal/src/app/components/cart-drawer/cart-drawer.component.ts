import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css'
})
export class CartDrawerComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  cartItems$ = this.cartService.cartItems$;
  subtotal$ = this.cartService.subtotal$;

  constructor(private cartService: CartService, private router: Router) {}

  updateQuantity(itemId: number, delta: number) {
    this.cartService.updateQuantity(itemId, delta);
  }

  removeItem(itemId: number) {
    this.cartService.removeItem(itemId);
  }

  checkout() {
    this.closeDrawer();
    this.router.navigate(['/checkout']);
  }

  closeDrawer() {
    this.close.emit();
  }
}
