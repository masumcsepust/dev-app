import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PharmacyService } from '../../services/pharmacy.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pharmacy-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pharmacy-checkout.component.html',
  styleUrl: './pharmacy-checkout.component.css'
})
export class PharmacyCheckoutComponent implements OnInit {
  cart$ = this.svc.cart$;
  form = { customerName: '', customerPhone: '', customerEmail: '', deliveryAddress: '', notes: '' };
  loading = false;
  error = '';
  success = false;
  orderId: number | null = null;

  constructor(private svc: PharmacyService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.form.customerName = `${user.firstName} ${user.lastName}`.trim();
      this.form.customerPhone = user.phoneNumber ?? '';
      this.form.customerEmail = user.email ?? '';
    }
  }

  get total() { return this.svc.cartTotal; }

  submit() {
    const cart = this.svc['_cart'].value;
    if (!cart.length) return;
    this.loading = true;
    this.error = '';
    const payload = {
      customerName: this.form.customerName,
      customerPhone: this.form.customerPhone,
      customerEmail: this.form.customerEmail,
      deliveryAddress: this.form.deliveryAddress,
      notes: this.form.notes,
      items: cart.map(i => ({ medicineId: i.medicine.id, quantity: i.quantity }))
    };
    this.svc.placeOrder(payload).subscribe({
      next: o => { this.orderId = o.id; this.success = true; this.svc.clearCart(); this.loading = false; },
      error: e => { this.error = e.error?.message || e.error?.title || 'Order failed. Please try again.'; this.loading = false; }
    });
  }
}
