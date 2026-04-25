import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Restaurant, RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-form.component.html',
  styleUrls: ['./restaurant-form.component.css']
})
export class RestaurantFormComponent {
  restaurants: Restaurant[] = [];
  newRestaurant: Omit<Restaurant, 'id' | 'description' | 'rating' | 'deliveryTime' | 'tags' | 'menu'> = {
    name: '',
    cuisine: '',
    location: '',
    image: ''
  };
  successMessage = '';
  errorMessage = '';

  constructor(private restaurantService: RestaurantService) {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.restaurantService.getRestaurants().subscribe((restaurants) => {
      this.restaurants = restaurants;
    });
  }

  addRestaurant() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.newRestaurant.name || !this.newRestaurant.cuisine || !this.newRestaurant.location) {
      this.errorMessage = 'Please fill in the restaurant name, cuisine, and location.';
      return;
    }

    this.restaurantService.createRestaurant(this.newRestaurant).subscribe((restaurant) => {
      this.restaurants = [...this.restaurants, restaurant];
      this.successMessage = `${restaurant.name} has been added successfully.`;
      this.newRestaurant = { name: '', cuisine: '', location: '', image: '' };
    });
  }
}
