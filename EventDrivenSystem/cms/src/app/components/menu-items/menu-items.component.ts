import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RestaurantService, Restaurant, FoodCategory, MenuItem } from '../../services/restaurant.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { PaginatePipe } from '../../shared/paginate.pipe';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginationComponent, PaginatePipe],
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.css']
})
export class MenuItemsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  selectedRestaurantId: number | null = null;
  categories: FoodCategory[] = [];
  menuItems: MenuItem[] = [];
  page = 1;
  pageSize = 10;
  searchQuery = '';
  categoryFilter: number | '' = '';
  viewMode: 'grid' | 'list' = 'grid';
  loading = false;
  showModal = false;
  editingId: number | null = null;
  saving = false;
  deleteConfirmId: number | null = null;
  deleting = false;
  toast = { show: false, message: '', type: 'success' };
  form: FormGroup;

  currentImageUrl = '';
  imagePreview: string | null = null;
  uploadingImage = false;
  readonly apiBase = 'http://localhost:5043';

  constructor(private restaurantService: RestaurantService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', Validators.maxLength(1000)],
      price:       [null, [Validators.required, Validators.min(0), Validators.max(10000)]],
      categoryId:  [null],
      isAvailable: [true],
    });
  }

  ngOnInit() {
    this.restaurantService.getRestaurants().subscribe({
      next: r => {
        this.restaurants = r;
        if (r.length) { this.selectedRestaurantId = r[0].id; this.loadData(); }
      }
    });
  }

  onRestaurantChange(event: Event) {
    this.selectedRestaurantId = +((event.target as HTMLSelectElement).value);
    this.categoryFilter = '';
    this.searchQuery = '';
    this.loadData();
  }

  loadData() {
    if (!this.selectedRestaurantId) return;
    this.loading = true;
    forkJoin([
      this.restaurantService.getCategories(this.selectedRestaurantId).pipe(catchError(() => of([] as FoodCategory[]))),
      this.restaurantService.getMenuItems(this.selectedRestaurantId).pipe(catchError(() => of([] as MenuItem[])))
    ]).subscribe({
      next: ([cats, items]) => {
        this.categories = cats;
        this.menuItems = items;
        this.loading = false;
      },
      error: () => { this.showToast('Failed to load menu items', 'error'); this.loading = false; }
    });
  }

  get filteredItems(): MenuItem[] {
    return this.menuItems.filter(item => {
      const matchSearch = !this.searchQuery || item.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = !this.categoryFilter || item.categoryId === +this.categoryFilter;
      return matchSearch && matchCat;
    });
  }

  openAdd() {
    this.editingId = null;
    this.currentImageUrl = '';
    this.imagePreview = null;
    this.form.reset({ isAvailable: true });
    this.showModal = true;
  }

  openEdit(item: MenuItem) {
    this.editingId = item.id;
    this.currentImageUrl = item.imageUrl || '';
    this.imagePreview = item.imageUrl ? this.resolveImageUrl(item.imageUrl) : null;
    this.form.patchValue({
      name: item.name, description: item.description, price: item.price,
      categoryId: item.categoryId, isAvailable: item.isAvailable
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.currentImageUrl = '';
    this.imagePreview = null;
    this.form.reset({ isAvailable: true });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);

    this.uploadingImage = true;
    this.restaurantService.uploadMenuItemImage(file).subscribe({
      next: res => { this.currentImageUrl = res.imageUrl; this.uploadingImage = false; },
      error: () => { this.uploadingImage = false; this.showToast('Image upload failed', 'error'); }
    });
  }

  resolveImageUrl(url: string): string {
    if (!url) return this.getImageFallback();
    return url.startsWith('/uploads') ? `${this.apiBase}${url}` : url;
  }

  submit() {
    if (this.form.invalid || !this.selectedRestaurantId) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;
    const dto = { ...v, restaurantId: this.selectedRestaurantId, categoryId: v.categoryId || null, imageUrl: this.currentImageUrl };

    if (this.editingId) {
      this.restaurantService.updateMenuItem(this.editingId, dto).subscribe({
        next: updated => {
          const i = this.menuItems.findIndex(m => m.id === this.editingId);
          if (i !== -1) this.menuItems[i] = updated;
          this.saving = false; this.closeModal();
          this.showToast('Menu item updated', 'success');
        },
        error: () => { this.saving = false; this.showToast('Failed to update', 'error'); }
      });
    } else {
      this.restaurantService.createMenuItem(dto).subscribe({
        next: created => {
          this.menuItems = [created, ...this.menuItems];
          this.saving = false; this.closeModal();
          this.showToast('Menu item created', 'success');
        },
        error: () => { this.saving = false; this.showToast('Failed to create', 'error'); }
      });
    }
  }

  toggleAvailability(item: MenuItem) {
    const dto = { restaurantId: item.restaurantId, categoryId: item.categoryId, name: item.name, description: item.description, price: item.price, imageUrl: item.imageUrl, isAvailable: !item.isAvailable };
    this.restaurantService.updateMenuItem(item.id, dto).subscribe({
      next: updated => {
        const i = this.menuItems.findIndex(m => m.id === item.id);
        if (i !== -1) this.menuItems[i] = updated;
      }
    });
  }

  confirmDelete(id: number) { this.deleteConfirmId = id; }
  cancelDelete() { this.deleteConfirmId = null; }

  doDelete() {
    if (!this.deleteConfirmId) return;
    this.deleting = true;
    this.restaurantService.deleteMenuItem(this.deleteConfirmId).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter(m => m.id !== this.deleteConfirmId);
        this.deleteConfirmId = null; this.deleting = false;
        this.showToast('Item deleted', 'success');
      },
      error: () => { this.deleting = false; this.showToast('Failed to delete', 'error'); }
    });
  }

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return 'Uncategorized';
    return this.categories.find(c => c.id === categoryId)?.name ?? 'Uncategorized';
  }

  getImageFallback(): string {
    return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80';
  }

  formatPrice(price: number): string {
    return '৳' + price.toLocaleString('en-BD');
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
