import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  location: string;
  image: string;
  description: string;
  rating: number;
  deliveryTime: string;
  tags: string[];
  menu: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private restaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Luigi\'s Pizza',
      cuisine: 'Italian',
      location: 'Downtown',
      image: 'assets/images/pizza_card_1777100990460.png',
      description: 'Classic slices, fresh ingredients, and family favorites.',
      rating: 4.8,
      deliveryTime: '25-35 min',
      tags: ['Pizza', 'Family'],
      menu: []
    },
    {
      id: 2,
      name: 'Tokyo Sushi',
      cuisine: 'Japanese',
      location: 'Uptown',
      image: 'assets/images/sushi_card_1777100990460.png',
      description: 'Fresh sushi rolls, sashimi platters, and chef specials.',
      rating: 4.9,
      deliveryTime: '30-40 min',
      tags: ['Sushi', 'Fresh'],
      menu: []
    }
  ];

  getRestaurants(): Observable<Restaurant[]> {
    return of(this.restaurants);
  }

  createRestaurant(restaurant: Omit<Restaurant, 'id' | 'description' | 'rating' | 'deliveryTime' | 'tags' | 'menu'>): Observable<Restaurant> {
    const nextId = Math.max(0, ...this.restaurants.map((item) => item.id)) + 1;
    const newRestaurant: Restaurant = {
      id: nextId,
      description: 'Created by CMS owner',
      rating: 4.5,
      deliveryTime: '30-40 min',
      tags: ['New'],
      menu: [],
      ...restaurant
    };

    this.restaurants = [...this.restaurants, newRestaurant];
    return of(newRestaurant);
  }
}
