import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService, DashboardStats, Reservation, MenuItem } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-dashboard.component.html',
  styleUrls: ['./restaurant-dashboard.component.css']
})
export class RestaurantDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit() {
    this.restaurantService.getDashboardStats().subscribe({
      next: s => { this.stats = s; this.loading = false; },
      error: () => { this.error = 'Failed to load dashboard data.'; this.loading = false; }
    });
  }

  getTableUtilization(): number {
    if (!this.stats) return 0;
    const total = this.stats.totalTables;
    if (!total) return 0;
    return Math.round((this.stats.tableStats.occupied + this.stats.tableStats.reserved) / total * 100);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Booked: 'badge-blue', Seated: 'badge-purple', Completed: 'badge-green',
      Cancelled: 'badge-red', NoShow: 'badge-gray'
    };
    return map[status] ?? 'badge-gray';
  }

  getTableStatusClass(status: string): string {
    const map: Record<string, string> = {
      Available: 'badge-green', Occupied: 'badge-red',
      Reserved: 'badge-amber', Maintenance: 'badge-gray'
    };
    return map[status] ?? 'badge-gray';
  }

  formatPrice(price: number): string {
    return '৳' + price.toLocaleString('en-BD');
  }

  getImageFallback(item: MenuItem): string {
    return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80';
  }
}
