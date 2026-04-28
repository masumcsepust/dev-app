import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService, Restaurant, FoodCategory, MenuItem } from '../../services/restaurant.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  restaurants: Restaurant[] = [];
  selectedRestaurantId: number | null = null;
  categories: FoodCategory[] = [];
  menuItemCounts: Record<number, number | undefined> = {};
  loading = false;
  showModal = false;
  editingId: number | null = null;
  saving = false;
  deleteConfirmId: number | null = null;
  deleting = false;
  toast = { show: false, message: '', type: 'success' };
  form: FormGroup;

  constructor(private restaurantService: RestaurantService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit() {
    this.restaurantService.getRestaurants().subscribe({
      next: r => {
        this.restaurants = r;
        if (r.length) { this.selectedRestaurantId = r[0].id; this.loadCategories(); }
      }
    });
  }

  onRestaurantChange(event: Event) {
    this.selectedRestaurantId = +((event.target as HTMLSelectElement).value);
    this.loadCategories();
  }

  loadCategories() {
    if (!this.selectedRestaurantId) return;
    this.loading = true;
    forkJoin([
      this.restaurantService.getCategories(this.selectedRestaurantId),
      this.restaurantService.getMenuItems(this.selectedRestaurantId).pipe(catchError(() => of([] as MenuItem[])))
    ]).subscribe({
      next: ([cats, items]) => {
        this.categories = cats;
        this.menuItemCounts = {};
        items.forEach(i => {
          if (i.categoryId != null) this.menuItemCounts[i.categoryId] = (this.menuItemCounts[i.categoryId] ?? 0) + 1;
        });
        this.loading = false;
      },
      error: () => { this.showToast('Failed to load categories', 'error'); this.loading = false; }
    });
  }

  openAdd() { this.editingId = null; this.form.reset(); this.showModal = true; }

  openEdit(c: FoodCategory) {
    this.editingId = c.id;
    this.form.patchValue({ name: c.name, description: c.description });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; this.form.reset(); }

  submit() {
    if (this.form.invalid || !this.selectedRestaurantId) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;

    if (this.editingId) {
      this.restaurantService.updateCategory(this.editingId, v).subscribe({
        next: updated => {
          const i = this.categories.findIndex(c => c.id === this.editingId);
          if (i !== -1) this.categories[i] = updated;
          this.saving = false; this.closeModal();
          this.showToast('Category updated', 'success');
        },
        error: () => { this.saving = false; this.showToast('Failed to update category', 'error'); }
      });
    } else {
      this.restaurantService.createCategory({ restaurantId: this.selectedRestaurantId, ...v }).subscribe({
        next: created => {
          this.categories = [created, ...this.categories];
          this.saving = false; this.closeModal();
          this.showToast('Category created', 'success');
        },
        error: () => { this.saving = false; this.showToast('Failed to create category', 'error'); }
      });
    }
  }

  confirmDelete(id: number) { this.deleteConfirmId = id; }
  cancelDelete() { this.deleteConfirmId = null; }

  doDelete() {
    if (!this.deleteConfirmId) return;
    this.deleting = true;
    this.restaurantService.deleteCategory(this.deleteConfirmId).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== this.deleteConfirmId);
        this.deleteConfirmId = null; this.deleting = false;
        this.showToast('Category deleted', 'success');
      },
      error: () => { this.deleting = false; this.showToast('Failed to delete', 'error'); }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3500);
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
