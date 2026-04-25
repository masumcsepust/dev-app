import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantService, Restaurant, MenuItem } from '../../services/restaurant.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css'
})
export class RestaurantComponent implements OnInit {
  restaurant?: Restaurant;
  activeCategory = 'All';
  categories: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.restaurantService.getRestaurant(id).subscribe((restaurant) => {
      this.restaurant = restaurant;
      this.categories = restaurant ? ['All', ...new Set(restaurant.menu.map((item) => item.category))] : [];
    });
  }

  addToCart(item: MenuItem) {
    if (!this.restaurant) {
      return;
    }
    this.cartService.addItem(item, this.restaurant.id, this.restaurant.name);
  }

  get filteredMenu() {
    if (!this.restaurant) {
      return [];
    }
    if (this.activeCategory === 'All') {
      return this.restaurant.menu;
    }
    return this.restaurant.menu.filter((item) => item.category === this.activeCategory);
  }
}
