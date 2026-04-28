import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PharmacyService } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-cms-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pharmacy-cms-dashboard.component.html',
  styleUrls: ['./pharmacy-cms-dashboard.component.css']
})
export class PharmacyCmsDashboardComponent implements OnInit {
  stats = { totalMedicines: 0, totalCategories: 0, totalOrders: 0, totalPrescriptions: 0, pendingPrescriptions: 0, lowStock: 0 };
  recentOrders: any[] = [];
  loading = true;

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit() {
    forkJoin({
      medicines: this.pharmacyService.getMedicines({}),
      categories: this.pharmacyService.getCategories(),
      orders: this.pharmacyService.getOrders(),
      prescriptions: this.pharmacyService.getPrescriptions()
    }).subscribe({
      next: ({ medicines, categories, orders, prescriptions }) => {
        this.stats.totalMedicines = medicines.length;
        this.stats.totalCategories = categories.length;
        this.stats.totalOrders = orders.length;
        this.stats.totalPrescriptions = prescriptions.length;
        this.stats.pendingPrescriptions = prescriptions.filter(p => p.status === 'Pending').length;
        this.stats.lowStock = medicines.filter(m => m.stockQuantity < 10).length;
        this.recentOrders = orders.slice(0, 8);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  statusClass(status: string) {
    return { 'Placed': 'st-placed', 'Processing': 'st-processing', 'Ready': 'st-ready', 'Delivered': 'st-delivered', 'Cancelled': 'st-cancelled' }[status] || '';
  }
}
