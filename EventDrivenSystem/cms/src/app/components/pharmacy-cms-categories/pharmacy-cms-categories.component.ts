import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService, MedicineCategory } from '../../services/pharmacy.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { PaginatePipe } from '../../shared/paginate.pipe';

@Component({
  selector: 'app-pharmacy-cms-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, PaginatePipe],
  templateUrl: './pharmacy-cms-categories.component.html',
  styleUrls: ['./pharmacy-cms-categories.component.css']
})
export class PharmacyCmsCategoriesComponent implements OnInit {
  categories: MedicineCategory[] = [];
  page = 1;
  pageSize = 10;
  form = { name: '', description: '' };
  editId: number | null = null;
  loading = false;
  saving = false;
  error = '';

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.pharmacyService.getCategories().subscribe({ next: c => { this.categories = c; this.loading = false; }, error: () => this.loading = false });
  }

  startEdit(cat: MedicineCategory) { this.editId = cat.id; this.form = { name: cat.name, description: cat.description }; }

  cancelEdit() { this.editId = null; this.form = { name: '', description: '' }; this.error = ''; }

  save() {
    if (!this.form.name.trim()) { this.error = 'Name is required.'; return; }
    this.saving = true; this.error = '';
    const obs = this.editId
      ? this.pharmacyService.updateCategory(this.editId, this.form)
      : this.pharmacyService.createCategory(this.form);
    obs.subscribe({
      next: () => { this.load(); this.cancelEdit(); this.saving = false; },
      error: () => { this.error = 'Save failed.'; this.saving = false; }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this category?')) return;
    this.pharmacyService.deleteCategory(id).subscribe({ next: () => this.load(), error: () => alert('Delete failed') });
  }
}
