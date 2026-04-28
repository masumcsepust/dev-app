import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyService, Medicine, MedicineCategory } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-medicines',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pharmacy-medicines.component.html',
  styleUrl: './pharmacy-medicines.component.css'
})
export class PharmacyMedicinesComponent implements OnInit {
  medicines: Medicine[] = [];
  categories: MedicineCategory[] = [];
  search = '';
  selectedCategory: number | undefined;
  loading = true;

  constructor(private svc: PharmacyService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.selectedCategory = p['categoryId'] ? +p['categoryId'] : undefined;
      this.load();
    });
    this.svc.getCategories().subscribe(c => this.categories = c);
  }

  load() {
    this.loading = true;
    this.svc.getMedicines(this.search || undefined, this.selectedCategory).subscribe(m => {
      this.medicines = m;
      this.loading = false;
    });
  }

  addToCart(m: Medicine) { this.svc.addToCart(m, 1); }
}
