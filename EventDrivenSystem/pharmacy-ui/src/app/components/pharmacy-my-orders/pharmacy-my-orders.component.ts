import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService, PharmacyOrder } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-my-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pharmacy-my-orders.component.html',
  styleUrl: './pharmacy-my-orders.component.css'
})
export class PharmacyMyOrdersComponent {
  phone = '';
  orders: PharmacyOrder[] = [];
  loading = false;
  searched = false;

  constructor(private svc: PharmacyService) {}

  search() {
    if (!this.phone) return;
    this.loading = true;
    this.searched = true;
    this.svc.getOrdersByPhone(this.phone).subscribe({
      next: o => { this.orders = o; this.loading = false; },
      error: () => this.loading = false
    });
  }

  statusClass(s: string) {
    const map: Record<string, string> = {
      Placed: 'badge-blue', Processing: 'badge-yellow', Ready: 'badge-green',
      Delivered: 'badge-gray', Cancelled: 'badge-red'
    };
    return map[s] ?? 'badge-gray';
  }

  expanded: Set<number> = new Set();
  toggle(id: number) { this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id); }
}
