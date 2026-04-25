import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RestaurantItem {
  name: string;
  cuisine: string;
  location: string;
  image: string;
}

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurants.component.html',
  styleUrl: './restaurants.component.css'
})
export class RestaurantsComponent {
  restaurants: RestaurantItem[] = [
    { name: 'Luigi\'s Pizza', cuisine: 'Italian', location: 'Downtown', image: 'assets/images/pizza_card_1777100990460.png' },
    { name: 'Burger Palace', cuisine: 'American', location: 'Midtown', image: 'assets/images/burger_card_1777101030879.png' },
    { name: 'Tokyo Sushi', cuisine: 'Japanese', location: 'Uptown', image: 'assets/images/sushi_card_1777101010849.png' }
  ];

  newRestaurant: RestaurantItem = { name: '', cuisine: '', location: '', image: 'assets/images/pizza_card_1777100990460.png' };

  addRestaurant() {
    if (!this.newRestaurant.name || !this.newRestaurant.cuisine || !this.newRestaurant.location) {
      return;
    }

    this.restaurants = [...this.restaurants, { ...this.newRestaurant }];
    this.newRestaurant = { name: '', cuisine: '', location: '', image: 'assets/images/pizza_card_1777100990460.png' };
  }
}
