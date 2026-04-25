import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  customerName = '';
  deliveryAddress = '';
  paymentMethod = 'Credit Card';

  cartItems$ = this.cartService.cartItems$;
  subtotal$ = this.cartService.subtotal$;

  constructor(private cartService: CartService, private router: Router) {}

  placeOrder() {
    if (!this.customerName || !this.deliveryAddress) {
      return;
    }
    this.cartService.placeOrder(this.customerName, this.deliveryAddress);
    this.router.navigate(['/confirmation']);
  }
}
