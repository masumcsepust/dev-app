import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { CategoryCarouselComponent } from '../../components/category-carousel/category-carousel.component';
import { RestaurantCardComponent } from '../../components/restaurant-card/restaurant-card.component';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroBannerComponent, CategoryCarouselComponent, RestaurantCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  restaurants: Restaurant[] = [];
  categories = [
    { name: 'Pizza', icon: '🍕' },
    { name: 'Burgers', icon: '🍔' },
    { name: 'Sushi', icon: '🍣' },
    { name: 'Salads', icon: '🥗' },
    { name: 'Desserts', icon: '🍨' }
  ];
  activeCategory = '';

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit() {
    this.restaurantService.getRestaurants().subscribe((restaurants) => {
      this.restaurants = restaurants;
    });
  }

  filterByCategory(category: string) {
    this.activeCategory = category;
  }

  get filteredRestaurants() {
    if (!this.activeCategory) {
      return this.restaurants;
    }
    return this.restaurants.filter((restaurant) => restaurant.tags.includes(this.activeCategory) || restaurant.cuisine === this.activeCategory);
  }
}
