import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService, PharmacyOrder } from '../../services/pharmacy.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { PaginatePipe } from '../../shared/paginate.pipe';

@Component({
  selector: 'app-pharmacy-cms-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, PaginatePipe],
  templateUrl: './pharmacy-cms-orders.component.html',
  styleUrls: ['./pharmacy-cms-orders.component.css']
})
export class PharmacyCmsOrdersComponent implements OnInit {
  orders: PharmacyOrder[] = [];
  page = 1;
  pageSize = 10;
  loading = false;
  selected: PharmacyOrder | null = null;
  newStatus = '';
  updating = false;

  readonly STATUSES = ['Placed', 'Processing', 'Ready', 'Delivered', 'Cancelled'];

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.pharmacyService.getOrders().subscribe({ next: o => { this.orders = o; this.loading = false; }, error: () => this.loading = false });
  }

  openOrder(order: PharmacyOrder) { this.selected = order; this.newStatus = order.status; }

  updateStatus() {
    if (!this.selected || !this.newStatus) return;
    this.updating = true;
    this.pharmacyService.updateOrderStatus(this.selected.id, this.newStatus).subscribe({
      next: () => { this.load(); this.selected = null; this.updating = false; },
      error: () => { alert('Update failed'); this.updating = false; }
    });
  }

  statusClass(status: string) {
    return { 'Placed': 'st-placed', 'Processing': 'st-processing', 'Ready': 'st-ready', 'Delivered': 'st-delivered', 'Cancelled': 'st-cancelled' }[status] || '';
  }
}
