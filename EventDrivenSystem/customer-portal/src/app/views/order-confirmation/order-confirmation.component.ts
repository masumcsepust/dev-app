import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, OrderSummary } from '../../services/cart.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent {
  latestOrder$ = this.cartService.latestOrder$;

  constructor(private cartService: CartService, private router: Router) {}

  returnHome() {
    this.router.navigate(['/']);
  }
}
