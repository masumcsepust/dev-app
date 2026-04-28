import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PharmacyService, Medicine, MedicineCategory } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pharmacy-home.component.html',
  styleUrl: './pharmacy-home.component.css'
})
export class PharmacyHomeComponent implements OnInit {
  categories: MedicineCategory[] = [];
  featured: Medicine[] = [];
  loading = true;

  constructor(private svc: PharmacyService) {}

  ngOnInit() {
    this.svc.getCategories().subscribe(c => { this.categories = c; });
    this.svc.getMedicines().subscribe(m => {
      this.featured = m.filter(x => x.isAvailable).slice(0, 8);
      this.loading = false;
    });
  }

  addToCart(m: Medicine) { this.svc.addToCart(m, 1); }
}
