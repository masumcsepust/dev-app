import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyService, Medicine } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-medicine-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pharmacy-medicine-detail.component.html',
  styleUrls: ['./pharmacy-medicine-detail.component.css']
})
export class PharmacyMedicineDetailComponent implements OnInit {
  medicine: Medicine | null = null;
  loading = true;
  qty = 1;
  added = false;

  constructor(private route: ActivatedRoute, private pharmacyService: PharmacyService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pharmacyService.getMedicine(id).subscribe({
      next: m => { this.medicine = m; this.loading = false; },
      error: () => this.loading = false
    });
  }

  addToCart() {
    if (!this.medicine) return;
    this.pharmacyService.addToCart(this.medicine, this.qty);
    this.added = true;
    setTimeout(() => this.added = false, 2000);
  }
}
