import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';

@Component({
  selector: 'app-customer-restaurants',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './customer-restaurants.component.html',
  styleUrls: ['./customer-restaurants.component.css']
})
export class CustomerRestaurantsComponent implements OnInit {
  all: Restaurant[] = [];
  searchQuery = '';
  selectedCuisine = '';
  loading = true;

  constructor(
    private restaurantService: RestaurantService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchQuery = params['q'];
    });
    this.restaurantService.getRestaurants().subscribe({
      next: data => { this.all = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get cuisines(): string[] {
    return [...new Set(this.all.map(r => r.cuisine).filter(Boolean))].sort();
  }

  get filtered(): Restaurant[] {
    return this.all.filter(r => {
      const matchQ = !this.searchQuery ||
        r.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchC = !this.selectedCuisine || r.cuisine === this.selectedCuisine;
      return matchQ && matchC;
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCuisine = '';
  }
}
