import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PharmacyService, MedicineCategory, Medicine } from '../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pharmacy-home.component.html',
  styleUrls: ['./pharmacy-home.component.css']
})
export class PharmacyHomeComponent implements OnInit {
  categories: MedicineCategory[] = [];
  featured: Medicine[] = [];
  searchQuery = '';

  constructor(private pharmacyService: PharmacyService, private router: Router) {}

  ngOnInit() {
    this.pharmacyService.getCategories().subscribe(c => this.categories = c);
    this.pharmacyService.getMedicines().subscribe(m => {
      this.featured = m.filter(x => x.isAvailable && !x.requiresPrescription).slice(0, 8);
    });
  }

  search() {
    if (this.searchQuery.trim())
      this.router.navigate(['/pharmacy/medicines'], { queryParams: { search: this.searchQuery.trim() } });
  }

  addToCart(med: Medicine) {
    this.pharmacyService.addToCart(med, 1);
  }
}
