import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyService, Medicine, MedicineCategory } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-medicines',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pharmacy-medicines.component.html',
  styleUrls: ['./pharmacy-medicines.component.css']
})
export class PharmacyMedicinesComponent implements OnInit {
  medicines: Medicine[] = [];
  categories: MedicineCategory[] = [];
  loading = false;
  search = '';
  selectedCategory: number | null = null;
  rxFilter: boolean | null = null;
  addedId: number | null = null;

  constructor(private pharmacyService: PharmacyService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.pharmacyService.getCategories().subscribe(c => this.categories = c);
    this.route.queryParams.subscribe(p => {
      this.search = p['search'] || '';
      this.selectedCategory = p['categoryId'] ? +p['categoryId'] : null;
      this.load();
    });
  }

  load() {
    this.loading = true;
    const params: any = {};
    if (this.search) params.search = this.search;
    if (this.selectedCategory != null) params.categoryId = this.selectedCategory;
    if (this.rxFilter != null) params.requiresPrescription = this.rxFilter;
    this.pharmacyService.getMedicines(params).subscribe({
      next: m => { this.medicines = m; this.loading = false; },
      error: () => this.loading = false
    });
  }

  addToCart(med: Medicine) {
    this.pharmacyService.addToCart(med, 1);
    this.addedId = med.id;
    setTimeout(() => this.addedId = null, 1800);
  }

  clearFilters() {
    this.search = ''; this.selectedCategory = null; this.rxFilter = null; this.load();
  }
}
