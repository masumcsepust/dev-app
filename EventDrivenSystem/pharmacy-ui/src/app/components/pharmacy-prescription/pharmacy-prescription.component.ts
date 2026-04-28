import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService, Prescription } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pharmacy-prescription.component.html',
  styleUrl: './pharmacy-prescription.component.css'
})
export class PharmacyPrescriptionComponent {
  tab: 'submit' | 'track' = 'submit';
  form = { patientName: '', patientPhone: '', doctorName: '', notes: '' };
  imageFile: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  success = false;
  error = '';

  trackPhone = '';
  prescriptions: Prescription[] = [];
  trackLoading = false;

  constructor(private svc: PharmacyService) {}

  onFile(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.imageFile = f;
    const reader = new FileReader();
    reader.onload = ev => this.imagePreview = ev.target?.result as string;
    reader.readAsDataURL(f);
  }

  submit() {
    if (!this.imageFile) { this.error = 'Please upload a prescription image.'; return; }
    this.loading = true;
    this.error = '';
    const fd = new FormData();
    fd.append('patientName', this.form.patientName);
    fd.append('patientPhone', this.form.patientPhone);
    fd.append('doctorName', this.form.doctorName);
    fd.append('notes', this.form.notes);
    fd.append('image', this.imageFile);

    this.svc.submitPrescription(fd).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: e => { this.error = e.error?.message || 'Submission failed.'; this.loading = false; }
    });
  }

  trackPrescriptions() {
    if (!this.trackPhone) return;
    this.trackLoading = true;
    this.svc.getMyPrescriptions(this.trackPhone).subscribe({
      next: p => { this.prescriptions = p; this.trackLoading = false; },
      error: () => this.trackLoading = false
    });
  }

  statusClass(s: string) {
    const map: Record<string, string> = { Pending: 'badge-yellow', Approved: 'badge-green', Dispensed: 'badge-blue', Rejected: 'badge-red' };
    return map[s] ?? 'badge-gray';
  }
}
