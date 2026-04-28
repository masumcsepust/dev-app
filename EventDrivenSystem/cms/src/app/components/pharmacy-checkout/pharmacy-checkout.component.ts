import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyService, CartItem, PharmacyOrder } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pharmacy-checkout.component.html',
  styleUrls: ['./pharmacy-checkout.component.css']
})
export class PharmacyCheckoutComponent {
  items: CartItem[] = [];
  form = { customerName: '', customerPhone: '', customerEmail: '', deliveryAddress: '', notes: '' };
  submitting = false;
  order: PharmacyOrder | null = null;
  error = '';

  constructor(public pharmacyService: PharmacyService) {
    this.pharmacyService.cart$.subscribe(i => this.items = i);
  }

  get total(): number { return this.pharmacyService.cartTotal; }

  submit() {
    if (!this.form.customerName || !this.form.customerPhone || !this.form.deliveryAddress) {
      this.error = 'Please fill all required fields.';
      return;
    }
    if (this.items.length === 0) { this.error = 'Your cart is empty.'; return; }
    this.error = '';
    this.submitting = true;
    const dto = {
      ...this.form,
      items: this.items.map(i => ({ medicineId: i.medicine.id, quantity: i.quantity }))
    };
    this.pharmacyService.createOrder(dto).subscribe({
      next: order => {
        this.order = order;
        this.pharmacyService.clearCart();
        this.submitting = false;
      },
      error: err => {
        this.error = err?.error?.error || 'Order failed. Please try again.';
        this.submitting = false;
      }
    });
  }
}
