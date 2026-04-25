import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OrderItem {
  id: string;
  customer: string;
  restaurant: string;
  items: string;
  total: string;
  status: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  restaurants = ['Luigi\'s Pizza', 'Burger Palace', 'Tokyo Sushi', 'Green Bowl'];
  users = ['John Doe', 'Mia Lee', 'Eli Smith', 'Ava Patel'];

  orders: OrderItem[] = [
    { id: '#1001', customer: 'John Doe', restaurant: 'Luigi\'s Pizza', items: 'Pepperoni Pizza', total: '$18.99', status: 'Preparing' },
    { id: '#1002', customer: 'Mia Lee', restaurant: 'Burger Palace', items: 'Cheeseburger + Fries', total: '$22.50', status: 'Delivered' }
  ];

  newOrder = { customer: '', restaurant: '', items: '', total: '', status: 'Pending' };

  addOrder() {
    if (!this.newOrder.customer || !this.newOrder.restaurant || !this.newOrder.items || !this.newOrder.total) {
      return;
    }

    this.orders = [
      ...this.orders,
      {
        id: `#${1000 + this.orders.length + 1}`,
        customer: this.newOrder.customer,
        restaurant: this.newOrder.restaurant,
        items: this.newOrder.items,
        total: this.newOrder.total,
        status: this.newOrder.status
      }
    ];

    this.newOrder = { customer: '', restaurant: '', items: '', total: '', status: 'Pending' };
  }
}
