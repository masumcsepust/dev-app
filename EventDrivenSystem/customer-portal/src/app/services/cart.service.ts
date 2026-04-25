import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { MenuItem } from './restaurant.service';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
}

export interface OrderSummary {
  orderId: string;
  items: CartItem[];
  total: number;
  customerName: string;
  deliveryAddress: string;
  placedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  private orderSubject = new BehaviorSubject<OrderSummary | null>(null);

  cartItems$ = this.itemsSubject.asObservable();
  itemCount$ = this.cartItems$.pipe(map((items) => items.reduce((sum, current) => sum + current.quantity, 0)));
  subtotal$ = this.cartItems$.pipe(map((items) => items.reduce((sum, current) => sum + current.item.price * current.quantity, 0)));
  latestOrder$ = this.orderSubject.asObservable();

  addItem(item: MenuItem, restaurantId: number, restaurantName: string) {
    const items = [...this.itemsSubject.value];
    const existing = items.find((cartItem) => cartItem.item.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ item, quantity: 1, restaurantId, restaurantName });
    }
    this.itemsSubject.next(items);
  }

  updateQuantity(itemId: number, delta: number) {
    const items = this.itemsSubject.value
      .map((cartItem) => {
        if (cartItem.item.id === itemId) {
          return { ...cartItem, quantity: Math.max(1, cartItem.quantity + delta) };
        }
        return cartItem;
      })
      .filter((cartItem) => cartItem.quantity > 0);
    this.itemsSubject.next(items);
  }

  removeItem(itemId: number) {
    this.itemsSubject.next(this.itemsSubject.value.filter((cartItem) => cartItem.item.id !== itemId));
  }

  clearCart() {
    this.itemsSubject.next([]);
  }

  placeOrder(customerName: string, deliveryAddress: string) {
    const items = this.itemsSubject.value;
    const total = items.reduce((sum, current) => sum + current.item.price * current.quantity, 0) + 3.99;
    const order: OrderSummary = {
      orderId: 'FD' + Math.floor(1000 + Math.random() * 9000),
      items,
      total,
      customerName,
      deliveryAddress,
      placedAt: new Date().toLocaleString()
    };
    this.orderSubject.next(order);
    this.clearCart();
    return order;
  }
}
