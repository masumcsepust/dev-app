import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyService, Medicine } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-medicine-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pharmacy-medicine-detail.component.html',
  styleUrl: './pharmacy-medicine-detail.component.css'
})
export class PharmacyMedicineDetailComponent implements OnInit {
  medicine: Medicine | null = null;
  loading = true;
  qty = 1;
  added = false;

  constructor(private route: ActivatedRoute, private svc: PharmacyService) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.svc.getMedicine(id).subscribe({ next: m => { this.medicine = m; this.loading = false; }, error: () => this.loading = false });
  }

  addToCart() {
    if (!this.medicine) return;
    this.svc.addToCart(this.medicine, this.qty);
    this.added = true;
    setTimeout(() => this.added = false, 2000);
  }
}
