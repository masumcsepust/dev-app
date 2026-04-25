import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  tags: string[];
  cuisine: string;
  menu: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private restaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Luigi’s Pizza',
      description: 'Wood-fired pizzas with fresh Italian toppings.',
      image: 'assets/images/pizza_card_1777100990460.png',
      rating: 4.8,
      deliveryTime: '22-30 min',
      tags: ['Italian', 'Pizza', 'Hot'],
      cuisine: 'Italian',
      menu: [
        { id: 101, name: 'Margherita', description: 'Tomato, fresh mozzarella, basil.', price: 12.95, image: 'assets/images/pizza_card_1777100990460.png', category: 'Pizza' },
        { id: 102, name: 'Pepperoni', description: 'Classic pepperoni with basil oil.', price: 14.95, image: 'assets/images/pizza_card_1777100990460.png', category: 'Pizza' },
        { id: 103, name: 'Italian Salad', description: 'Arugula, cherry tomatoes, parmesan.', price: 9.95, image: 'assets/images/healthy_card_1777101075399.png', category: 'Salads' }
      ]
    },
    {
      id: 2,
      name: 'Burger Palace',
      description: 'Gourmet burgers, crispy fries, and milkshakes.',
      image: 'assets/images/burger_card_1777101030879.png',
      rating: 4.7,
      deliveryTime: '18-25 min',
      tags: ['American', 'Burgers', 'Best Seller'],
      cuisine: 'American',
      menu: [
        { id: 201, name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, lettuce, tomato.', price: 13.5, image: 'assets/images/burger_card_1777101030879.png', category: 'Burgers' },
        { id: 202, name: 'Loaded Fries', description: 'Crispy fries with cheese sauce and bacon.', price: 7.95, image: 'assets/images/burger_card_1777101030879.png', category: 'Sides' },
        { id: 203, name: 'Vanilla Shake', description: 'Creamy vanilla milkshake with whipped cream.', price: 6.5, image: 'assets/images/burger_card_1777101030879.png', category: 'Drinks' }
      ]
    },
    {
      id: 3,
      name: 'Tokyo Sushi',
      description: 'Fresh sushi rolls and Japanese favorites.',
      image: 'assets/images/sushi_card_1777101010849.png',
      rating: 4.9,
      deliveryTime: '28-40 min',
      tags: ['Japanese', 'Sushi', 'Fresh'],
      cuisine: 'Japanese',
      menu: [
        { id: 301, name: 'Salmon Roll', description: 'Fresh salmon and avocado roll.', price: 15.95, image: 'assets/images/sushi_card_1777101010849.png', category: 'Sushi' },
        { id: 302, name: 'Dragon Roll', description: 'Shrimp tempura, avocado, eel sauce.', price: 18.95, image: 'assets/images/sushi_card_1777101010849.png', category: 'Sushi' },
        { id: 303, name: 'Miso Soup', description: 'Soybean broth with tofu and scallions.', price: 3.95, image: 'assets/images/sushi_card_1777101010849.png', category: 'Soups' }
      ]
    }
  ];

  getRestaurants(): Observable<Restaurant[]> {
    return of(this.restaurants);
  }

  getRestaurant(id: number): Observable<Restaurant | undefined> {
    return of(this.restaurants.find((restaurant) => restaurant.id === id));
  }
}
