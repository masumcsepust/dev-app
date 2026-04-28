import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyService, Medicine, Prescription } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-prescription',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pharmacy-prescription.component.html',
  styleUrls: ['./pharmacy-prescription.component.css']
})
export class PharmacyPrescriptionComponent implements OnInit {
  rxMedicines: Medicine[] = [];
  form = { customerName: '', customerPhone: '', customerEmail: '', doctorName: '', notes: '', imageUrl: '' };
  selectedItems: { medicineId: number; quantity: number }[] = [];
  imageFile: File | null = null;
  uploading = false;
  submitting = false;
  submitted: Prescription | null = null;
  error = '';

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit() {
    this.pharmacyService.getMedicines({ requiresPrescription: true }).subscribe(m => this.rxMedicines = m);
  }

  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.imageFile = input.files[0];
  }

  async uploadImage(): Promise<string> {
    if (!this.imageFile) return '';
    this.uploading = true;
    return new Promise((resolve, reject) => {
      this.pharmacyService.uploadPrescriptionImage(this.imageFile!).subscribe({
        next: r => { this.uploading = false; resolve(r.imageUrl); },
        error: () => { this.uploading = false; reject('Upload failed'); }
      });
    });
  }

  isSelected(id: number) { return this.selectedItems.some(i => i.medicineId === id); }

  toggleMedicine(id: number) {
    if (this.isSelected(id)) this.selectedItems = this.selectedItems.filter(i => i.medicineId !== id);
    else this.selectedItems.push({ medicineId: id, quantity: 1 });
  }

  getQty(id: number) { return this.selectedItems.find(i => i.medicineId === id)?.quantity || 1; }

  setQty(id: number, qty: number) {
    const item = this.selectedItems.find(i => i.medicineId === id);
    if (item) item.quantity = Math.max(1, qty);
  }

  async submit() {
    if (!this.form.customerName || !this.form.customerPhone) { this.error = 'Name and phone are required.'; return; }
    this.error = '';
    this.submitting = true;
    try {
      if (this.imageFile) this.form.imageUrl = await this.uploadImage();
    } catch { this.error = 'Image upload failed.'; this.submitting = false; return; }

    const dto = { ...this.form, items: this.selectedItems };
    this.pharmacyService.createPrescription(dto).subscribe({
      next: p => { this.submitted = p; this.submitting = false; },
      error: err => { this.error = err?.error?.error || 'Submission failed.'; this.submitting = false; }
    });
  }
}
