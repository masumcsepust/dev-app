import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyService, PharmacyOrder } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pharmacy-my-orders.component.html',
  styleUrls: ['./pharmacy-my-orders.component.css']
})
export class PharmacyMyOrdersComponent {
  orderId = '';
  order: PharmacyOrder | null = null;
  loading = false;
  error = '';

  constructor(private pharmacyService: PharmacyService) {}

  lookup() {
    if (!this.orderId.trim()) return;
    this.loading = true;
    this.error = '';
    this.order = null;
    this.pharmacyService.getOrder(+this.orderId.trim()).subscribe({
      next: o => { this.order = o; this.loading = false; },
      error: () => { this.error = 'Order not found.'; this.loading = false; }
    });
  }

  statusClass(status: string) {
    return {
      'Placed': 'st-placed', 'Processing': 'st-processing',
      'Ready': 'st-ready', 'Delivered': 'st-delivered', 'Cancelled': 'st-cancelled'
    }[status] || '';
  }
}
