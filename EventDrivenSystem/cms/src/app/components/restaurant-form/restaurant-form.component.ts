import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodCategory, MenuItem, Restaurant, RestaurantService, RestaurantTable, Reservation } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-form.component.html',
  styleUrls: ['./restaurant-form.component.css']
})
export class RestaurantFormComponent {
  restaurants: Restaurant[] = [];
  categories: FoodCategory[] = [];
  menuItems: MenuItem[] = [];
  tables: RestaurantTable[] = [];
  reservations: Reservation[] = [];

  selectedRestaurantId: number | null = null;

  newRestaurant = {
    name: '',
    cuisine: '',
    address: '',
    imageUrl: '',
    description: '',
    ownerId: 1
  };

  newCategory = {
    name: '',
    description: ''
  };

  newMenuItem = {
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
    imageUrl: ''
  };

  newTable = {
    tableNumber: 0,
    seatingCapacity: 1,
    isAvailable: true
  };

  newReservation = {
    customerName: '',
    customerPhone: '',
    reservationDateTime: '',
    guestsCount: 1,
    tableId: 0
  };

  successMessage = '';
  errorMessage = '';

  constructor(private restaurantService: RestaurantService) {
    this.loadRestaurants();
  }

  get selectedRestaurant(): Restaurant | undefined {
    return this.restaurants.find((restaurant) => restaurant.id === this.selectedRestaurantId) as Restaurant | undefined;
  }

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
      },
      error: () => {
        this.errorMessage = 'Failed to load restaurants from the backend.';
      }
    });
  }

  selectRestaurant(restaurantId: number): void {
    this.selectedRestaurantId = restaurantId;
    this.successMessage = '';
    this.errorMessage = '';
    this.loadRestaurantData();
  }

  onRestaurantSelection(): void {
    if (this.selectedRestaurantId) {
      this.loadRestaurantData();
    }
  }

  private loadRestaurantData(): void {
    if (!this.selectedRestaurantId) {
      return;
    }

    this.loadCategories();
    this.loadMenuItems();
    this.loadTables();
    this.loadReservations();
  }

  addRestaurant(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.newRestaurant.name || !this.newRestaurant.cuisine || !this.newRestaurant.address) {
      this.errorMessage = 'Please fill in all required restaurant details.';
      return;
    }

    this.restaurantService.createRestaurant(this.newRestaurant).subscribe({
      next: (restaurant) => {
        this.restaurants = [...this.restaurants, restaurant];
        this.successMessage = `${restaurant.name} has been created successfully.`;
        this.newRestaurant = { name: '', cuisine: '', address: '', imageUrl: '', description: '', ownerId: 1 };
      },
      error: () => {
        this.errorMessage = 'Unable to create restaurant. Confirm the RestaurantService is running and the ownerId is valid.';
      }
    });
  }

  loadCategories(): void {
    if (!this.selectedRestaurantId) {
      return;
    }

    this.restaurantService.getCategories(this.selectedRestaurantId).subscribe({
      next: (categories) => {
        this.categories = categories;
        if (categories.length && !this.newMenuItem.categoryId) {
          this.newMenuItem.categoryId = categories[0].id;
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load categories.';
      }
    });
  }

  addCategory(): void {
    if (!this.selectedRestaurantId || !this.newCategory.name) {
      this.errorMessage = 'Enter a category name before saving.';
      return;
    }

    this.restaurantService.createCategory({
      restaurantId: this.selectedRestaurantId,
      name: this.newCategory.name,
      description: this.newCategory.description
    }).subscribe({
      next: (category) => {
        this.categories = [...this.categories, category];
        this.successMessage = `Category '${category.name}' added.`;
        this.newCategory = { name: '', description: '' };
      },
      error: () => {
        this.errorMessage = 'Unable to create category.';
      }
    });
  }

  deleteCategory(categoryId: number): void {
    this.restaurantService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.categories = this.categories.filter((category) => category.id !== categoryId);
        this.successMessage = 'Category removed successfully.';
      },
      error: () => {
        this.errorMessage = 'Unable to delete category.';
      }
    });
  }

  loadMenuItems(): void {
    if (!this.selectedRestaurantId) {
      return;
    }

    this.restaurantService.getMenuItems(this.selectedRestaurantId).subscribe({
      next: (items) => {
        this.menuItems = items;
      },
      error: () => {
        this.errorMessage = 'Unable to load menu items.';
      }
    });
  }

  addMenuItem(): void {
    if (!this.selectedRestaurantId || !this.newMenuItem.name || this.newMenuItem.price <= 0) {
      this.errorMessage = 'Please enter a valid menu item name and price.';
      return;
    }

    this.restaurantService.createMenuItem({
      restaurantId: this.selectedRestaurantId,
      name: this.newMenuItem.name,
      description: this.newMenuItem.description,
      price: this.newMenuItem.price,
      categoryId: this.newMenuItem.categoryId,
      imageUrl: this.newMenuItem.imageUrl
    }).subscribe({
      next: (item) => {
        this.menuItems = [...this.menuItems, item];
        this.successMessage = `Menu item '${item.name}' added.`;
        this.newMenuItem = { name: '', description: '', price: 0, categoryId: this.categories.length ? this.categories[0].id : 0, imageUrl: '' };
      },
      error: () => {
        this.errorMessage = 'Unable to add menu item.';
      }
    });
  }

  deleteMenuItem(menuItemId: number): void {
    this.restaurantService.deleteMenuItem(menuItemId).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter((item) => item.id !== menuItemId);
        this.successMessage = 'Menu item deleted.';
      },
      error: () => {
        this.errorMessage = 'Unable to delete menu item.';
      }
    });
  }

  loadTables(): void {
    if (!this.selectedRestaurantId) {
      return;
    }

    this.restaurantService.getTables(this.selectedRestaurantId).subscribe({
      next: (tables) => {
        this.tables = tables;
      },
      error: () => {
        this.errorMessage = 'Unable to load tables.';
      }
    });
  }

  addTable(): void {
    if (!this.selectedRestaurantId || !this.newTable.tableNumber || this.newTable.seatingCapacity <= 0) {
      this.errorMessage = 'Enter a valid table number and number of seats.';
      return;
    }

    this.restaurantService.createTable({
      restaurantId: this.selectedRestaurantId,
      tableNumber: this.newTable.tableNumber,
      seatingCapacity: this.newTable.seatingCapacity,
    }).subscribe({
      next: (table) => {
        this.tables = [...this.tables, table];
        this.successMessage = `Table ${table.tableNumber} added.`;
        this.newTable = { tableNumber: 0, seatingCapacity: 1, isAvailable: true };
      },
      error: () => {
        this.errorMessage = 'Unable to create table.';
      }
    });
  }

  deleteTable(tableId: number): void {
    this.restaurantService.deleteTable(tableId).subscribe({
      next: () => {
        this.tables = this.tables.filter((table) => table.id !== tableId);
        this.successMessage = 'Table removed.';
      },
      error: () => {
        this.errorMessage = 'Unable to delete table.';
      }
    });
  }

  loadReservations(): void {
    if (!this.selectedRestaurantId) {
      return;
    }

    this.restaurantService.getReservations(this.selectedRestaurantId).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
      },
      error: () => {
        this.errorMessage = 'Unable to load reservations.';
      }
    });
  }

  addReservation(): void {
    if (!this.selectedRestaurantId || !this.newReservation.customerName || !this.newReservation.customerPhone || this.newReservation.guestsCount <= 0 || !this.newReservation.reservationDateTime || !this.newReservation.tableId) {
      this.errorMessage = 'Please complete all reservation fields and choose a table.';
      return;
    }

    this.restaurantService.createReservation({
      customerName: this.newReservation.customerName,
      customerPhone: this.newReservation.customerPhone,
      reservationDateTime: this.newReservation.reservationDateTime,
      guestsCount: this.newReservation.guestsCount,
      tableId: this.newReservation.tableId
    }).subscribe({
      next: (reservation) => {
        this.reservations = [...this.reservations, reservation];
        this.successMessage = `Reservation created for ${reservation.customerName}.`;
        this.newReservation = { customerName: '', customerPhone: '', reservationDateTime: '', guestsCount: 1, tableId: this.tables.length ? this.tables[0].id : 0 };
      },
      error: () => {
        this.errorMessage = 'Unable to create reservation.';
      }
    });
  }

  cancelReservation(reservationId: number): void {
    this.restaurantService.cancelReservation(reservationId).subscribe({
      next: () => {
        this.reservations = this.reservations.filter((reservation) => reservation.id !== reservationId);
        this.successMessage = 'Reservation canceled.';
      },
      error: () => {
        this.errorMessage = 'Unable to cancel reservation.';
      }
    });
  }
}
