import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  stats = [
    { label: 'Restaurants', value: 8, icon: '🍽️', route: '/restaurants' },
    { label: 'Orders', value: 24, icon: '🧾', route: '/orders' },
    { label: 'Users', value: 12, icon: '👥', route: '/users' },
    { label: 'Revenue', value: '$1.9K', icon: '💰', route: '/orders' }
  ];

  recentOrders = [
    { id: '#1023', customer: 'John Doe', restaurant: 'Luigi\'s Pizza', amount: '$28.98', status: 'Preparing' },
    { id: '#1022', customer: 'Mia Lee', restaurant: 'Burger Palace', amount: '$17.50', status: 'Delivered' },
    { id: '#1021', customer: 'Eli Smith', restaurant: 'Tokyo Sushi', amount: '$32.40', status: 'Out for delivery' }
  ];
}
