import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { PaginatePipe } from '../../shared/paginate.pipe';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent, PaginatePipe],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  page = 1;
  pageSize = 10;
  loading = true;
  showModal = false;
  editingId: number | null = null;
  saving = false;
  deleteConfirmId: number | null = null;
  deleting = false;
  toast = { show: false, message: '', type: 'success' };
  serverError = '';
  imagePreview = '';
  form: FormGroup;

  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.maxLength(150)]],
      cuisine:     ['', Validators.maxLength(100)],
      address:     ['', [Validators.required, Validators.maxLength(300)]],
      description: ['', Validators.maxLength(1000)],
      imageUrl:    [''],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: r => { this.restaurants = r; this.loading = false; },
      error: () => { this.showToast('Failed to load restaurants', 'error'); this.loading = false; }
    });
  }

  openAdd() {
    this.editingId = null;
    this.imagePreview = '';
    this.serverError = '';
    this.form.reset();
    this.showModal = true;
  }

  openEdit(r: Restaurant) {
    this.editingId = r.id;
    this.imagePreview = r.imageUrl || '';
    this.serverError = '';
    this.form.patchValue({ name: r.name, cuisine: r.cuisine, address: r.address, description: r.description, imageUrl: r.imageUrl });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.imagePreview = '';
    this.serverError = '';
    this.form.reset();
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.imagePreview = result;
      this.form.patchValue({ imageUrl: result });
    };
    reader.readAsDataURL(file);
  }

  onImageUrlChange() {
    const url = this.form.get('imageUrl')?.value;
    if (url && !url.startsWith('data:')) {
      this.imagePreview = url;
    }
  }

  clearImage() {
    this.imagePreview = '';
    this.form.patchValue({ imageUrl: '' });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.serverError = '';
    const v = this.form.value;

    const handleError = (err: any) => {
      this.saving = false;
      const errors = err?.error?.errors;
      if (errors) {
        const msgs = Object.values(errors).flat() as string[];
        this.serverError = msgs.join(' | ');
      } else if (err?.error?.title) {
        this.serverError = err.error.title;
      } else if (typeof err?.error === 'string') {
        this.serverError = err.error;
      } else {
        this.serverError = 'Something went wrong. Please try again.';
      }
    };

    if (this.editingId) {
      this.restaurantService.updateRestaurant(this.editingId, v).subscribe({
        next: updated => {
          const i = this.restaurants.findIndex(r => r.id === this.editingId);
          if (i !== -1) this.restaurants[i] = updated;
          this.saving = false;
          this.closeModal();
          this.showToast('Restaurant updated successfully', 'success');
        },
        error: handleError,
      });
    } else {
      const ownerId = this.authService.currentUserValue?.id ?? 1;
      this.restaurantService.createRestaurant({ ...v, ownerId }).subscribe({
        next: created => {
          this.restaurants = [created, ...this.restaurants];
          this.saving = false;
          this.closeModal();
          this.showToast('Restaurant created successfully', 'success');
        },
        error: handleError,
      });
    }
  }

  confirmDelete(id: number) { this.deleteConfirmId = id; }
  cancelDelete() { this.deleteConfirmId = null; }

  doDelete() {
    if (!this.deleteConfirmId) return;
    this.deleting = true;
    this.restaurantService.deleteRestaurant(this.deleteConfirmId).subscribe({
      next: () => {
        this.restaurants = this.restaurants.filter(r => r.id !== this.deleteConfirmId);
        this.deleteConfirmId = null;
        this.deleting = false;
        this.showToast('Restaurant deleted', 'success');
      },
      error: () => { this.deleting = false; this.showToast('Failed to delete restaurant', 'error'); }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3500);
  }

  getImageOrPlaceholder(r: Restaurant): string {
    return r.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80';
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
