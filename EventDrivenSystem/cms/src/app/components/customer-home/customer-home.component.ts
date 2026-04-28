import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.css']
})
export class CustomerHomeComponent implements OnInit {
  restaurants: Restaurant[] = [];
  searchQuery = '';
  loading = true;

  constructor(private restaurantService: RestaurantService, private router: Router) {}

  ngOnInit() {
    this.restaurantService.getRestaurants().subscribe({
      next: data => { this.restaurants = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  search() {
    const q = this.searchQuery.trim();
    this.router.navigate(['/portal/restaurants'], q ? { queryParams: { q } } : {});
  }

  get featured(): Restaurant[] { return this.restaurants.slice(0, 3); }
}
