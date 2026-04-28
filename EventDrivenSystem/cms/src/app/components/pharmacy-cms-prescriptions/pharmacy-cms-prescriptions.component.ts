import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService, Prescription } from '../../services/pharmacy.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { PaginatePipe } from '../../shared/paginate.pipe';

@Component({
  selector: 'app-pharmacy-cms-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, PaginatePipe],
  templateUrl: './pharmacy-cms-prescriptions.component.html',
  styleUrls: ['./pharmacy-cms-prescriptions.component.css']
})
export class PharmacyCmsPrescriptionsComponent implements OnInit {
  prescriptions: Prescription[] = [];
  page = 1;
  pageSize = 10;
  loading = false;
  selected: Prescription | null = null;
  updating = false;

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.pharmacyService.getPrescriptions().subscribe({ next: p => { this.prescriptions = p; this.loading = false; }, error: () => this.loading = false });
  }

  updateStatus(id: number, status: string) {
    this.updating = true;
    this.pharmacyService.updatePrescriptionStatus(id, status).subscribe({
      next: () => { this.load(); this.selected = null; this.updating = false; },
      error: () => { alert('Update failed'); this.updating = false; }
    });
  }

  statusClass(status: string) {
    return { 'Pending': 'st-pending', 'Approved': 'st-approved', 'Dispensed': 'st-dispensed', 'Rejected': 'st-rejected' }[status] || '';
  }
}
