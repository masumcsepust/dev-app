import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { RestaurantService, Restaurant, MenuItem, FoodCategory } from '../../services/restaurant.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-customer-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-menu.component.html',
  styleUrls: ['./customer-menu.component.css']
})
export class CustomerMenuComponent implements OnInit {
  restaurantId!: number;
  restaurant: Restaurant | null = null;
  categories: FoodCategory[] = [];
  menuItems: MenuItem[] = [];
  selectedCategoryId: number | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      restaurant: this.restaurantService.getRestaurant(this.restaurantId),
      categories: this.restaurantService.getCategories(this.restaurantId),
      items: this.restaurantService.getMenuItems(this.restaurantId),
    }).subscribe({
      next: ({ restaurant, categories, items }) => {
        this.restaurant = restaurant;
        this.categories = categories;
        this.menuItems = items.filter(i => i.isAvailable);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load menu. Please try again.';
        this.loading = false;
      }
    });
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId = id;
  }

  get filteredItems(): MenuItem[] {
    if (this.selectedCategoryId === null) return this.menuItems;
    return this.menuItems.filter(i => i.categoryId === this.selectedCategoryId);
  }

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return 'Uncategorised';
    return this.categories.find(c => c.id === categoryId)?.name ?? 'Other';
  }

  countByCategory(categoryId: number): number {
    return this.menuItems.filter(i => i.categoryId === categoryId).length;
  }
}
