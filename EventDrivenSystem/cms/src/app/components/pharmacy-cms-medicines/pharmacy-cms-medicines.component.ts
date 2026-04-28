import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService, Medicine, MedicineCategory } from '../../services/pharmacy.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { PaginatePipe } from '../../shared/paginate.pipe';

@Component({
  selector: 'app-pharmacy-cms-medicines',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, PaginatePipe],
  templateUrl: './pharmacy-cms-medicines.component.html',
  styleUrls: ['./pharmacy-cms-medicines.component.css']
})
export class PharmacyCmsMedicinesComponent implements OnInit {
  medicines: Medicine[] = [];
  page = 1;
  pageSize = 10;
  categories: MedicineCategory[] = [];
  loading = false;
  showForm = false;
  editId: number | null = null;
  saving = false;
  error = '';
  imageFile: File | null = null;
  uploading = false;

  readonly FORMS = ['Tablet','Capsule','Syrup','Injection','Cream','Drops','Inhaler','Other'];

  form: any = { name:'', genericName:'', manufacturer:'', description:'', sideEffects:'', dosage:'', form:'Tablet', price:0, stockQuantity:0, requiresPrescription:false, isAvailable:true, imageUrl:'', categoryId:null };

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit() {
    this.pharmacyService.getCategories().subscribe(c => this.categories = c);
    this.load();
  }

  load() {
    this.loading = true;
    this.pharmacyService.getMedicines({}).subscribe({ next: m => { this.medicines = m; this.loading = false; }, error: () => this.loading = false });
  }

  openForm(med?: Medicine) {
    if (med) {
      this.editId = med.id;
      this.form = { name: med.name, genericName: med.genericName, manufacturer: med.manufacturer, description: med.description, sideEffects: med.sideEffects, dosage: med.dosage, form: med.form, price: med.price, stockQuantity: med.stockQuantity, requiresPrescription: med.requiresPrescription, isAvailable: med.isAvailable, imageUrl: med.imageUrl, categoryId: med.categoryId };
    } else {
      this.editId = null;
      this.form = { name:'', genericName:'', manufacturer:'', description:'', sideEffects:'', dosage:'', form:'Tablet', price:0, stockQuantity:0, requiresPrescription:false, isAvailable:true, imageUrl:'', categoryId:null };
    }
    this.showForm = true; this.error = '';
  }

  closeForm() { this.showForm = false; this.error = ''; this.imageFile = null; }

  onImageChange(event: Event) { const f = (event.target as HTMLInputElement).files; if (f?.length) this.imageFile = f[0]; }

  async save() {
    if (!this.form.name) { this.error = 'Medicine name is required.'; return; }
    this.saving = true; this.error = '';
    if (this.imageFile) {
      this.uploading = true;
      try {
        const r = await this.pharmacyService.uploadMedicineImage(this.imageFile).toPromise();
        this.form.imageUrl = r?.imageUrl || '';
      } catch { this.error = 'Image upload failed.'; this.saving = false; this.uploading = false; return; }
      this.uploading = false;
    }
    const obs = this.editId ? this.pharmacyService.updateMedicine(this.editId, this.form) : this.pharmacyService.createMedicine(this.form);
    obs.subscribe({ next: () => { this.load(); this.closeForm(); this.saving = false; }, error: err => { this.error = err?.error?.error || 'Save failed.'; this.saving = false; } });
  }

  delete(id: number) {
    if (!confirm('Delete this medicine?')) return;
    this.pharmacyService.deleteMedicine(id).subscribe({ next: () => this.load(), error: () => alert('Delete failed') });
  }
}
