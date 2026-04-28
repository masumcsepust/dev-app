import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService, Restaurant, RestaurantTable, TableStatus, DiningArea } from '../../services/restaurant.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { PaginatePipe } from '../../shared/paginate.pipe';

@Component({
  selector: 'app-table-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent, PaginatePipe],
  templateUrl: './table-management.component.html',
  styleUrls: ['./table-management.component.css']
})
export class TableManagementComponent implements OnInit {
  restaurants: Restaurant[] = [];
  selectedRestaurantId: number | null = null;
  tables: RestaurantTable[] = [];
  page = 1;
  pageSize = 10;
  statusFilter: TableStatus | '' = '';
  loading = false;
  showModal = false;
  editingId: number | null = null;
  saving = false;
  deleteConfirmId: number | null = null;
  deleting = false;
  toast = { show: false, message: '', type: 'success' };
  form: FormGroup;

  statuses: TableStatus[] = ['Available', 'Occupied', 'Reserved', 'Maintenance'];
  areas: DiningArea[] = ['GroundFloor', 'Rooftop', 'FamilyZone', 'AC_Room'];

  areaLabels: Record<DiningArea, string> = {
    GroundFloor: 'Ground Floor',
    Rooftop: 'Rooftop',
    FamilyZone: 'Family Zone',
    AC_Room: 'AC Room',
  };

  constructor(private restaurantService: RestaurantService, private fb: FormBuilder) {
    this.form = this.fb.group({
      tableNumber:     [null, [Validators.required, Validators.min(1)]],
      seatingCapacity: [null, [Validators.required, Validators.min(1), Validators.max(20)]],
      status:          ['Available', Validators.required],
      area:            ['GroundFloor', Validators.required],
    });
  }

  ngOnInit() {
    this.restaurantService.getRestaurants().subscribe({
      next: r => {
        this.restaurants = r;
        if (r.length) { this.selectedRestaurantId = r[0].id; this.loadTables(); }
      }
    });
  }

  onRestaurantChange(event: Event) {
    this.selectedRestaurantId = +((event.target as HTMLSelectElement).value);
    this.statusFilter = '';
    this.loadTables();
  }

  loadTables() {
    if (!this.selectedRestaurantId) return;
    this.loading = true;
    this.restaurantService.getTables(this.selectedRestaurantId).subscribe({
      next: t => { this.tables = t; this.loading = false; },
      error: () => { this.showToast('Failed to load tables', 'error'); this.loading = false; }
    });
  }

  get filteredTables(): RestaurantTable[] {
    return this.statusFilter ? this.tables.filter(t => t.status === this.statusFilter) : this.tables;
  }

  getStatusCounts(): Record<string, number> {
    const counts: Record<string, number> = { Available: 0, Occupied: 0, Reserved: 0, Maintenance: 0 };
    this.tables.forEach(t => counts[t.status] = (counts[t.status] ?? 0) + 1);
    return counts;
  }

  openAdd() { this.editingId = null; this.form.reset({ status: 'Available', area: 'GroundFloor' }); this.showModal = true; }

  openEdit(t: RestaurantTable) {
    this.editingId = t.id;
    this.form.patchValue({ tableNumber: t.tableNumber, seatingCapacity: t.seatingCapacity, status: t.status, area: t.area });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; this.form.reset({ status: 'Available', area: 'GroundFloor' }); }

  submit() {
    if (this.form.invalid || !this.selectedRestaurantId) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;

    if (this.editingId) {
      this.restaurantService.updateTable(this.editingId, v).subscribe({
        next: updated => {
          const i = this.tables.findIndex(t => t.id === this.editingId);
          if (i !== -1) this.tables[i] = updated;
          this.saving = false; this.closeModal();
          this.showToast('Table updated', 'success');
        },
        error: () => { this.saving = false; this.showToast('Failed to update', 'error'); }
      });
    } else {
      this.restaurantService.createTable({ restaurantId: this.selectedRestaurantId, ...v }).subscribe({
        next: created => {
          this.tables = [...this.tables, created].sort((a, b) => a.tableNumber - b.tableNumber);
          this.saving = false; this.closeModal();
          this.showToast('Table added', 'success');
        },
        error: () => { this.saving = false; this.showToast('Failed to create', 'error'); }
      });
    }
  }

  confirmDelete(id: number) { this.deleteConfirmId = id; }
  cancelDelete() { this.deleteConfirmId = null; }

  doDelete() {
    if (!this.deleteConfirmId) return;
    this.deleting = true;
    this.restaurantService.deleteTable(this.deleteConfirmId).subscribe({
      next: () => {
        this.tables = this.tables.filter(t => t.id !== this.deleteConfirmId);
        this.deleteConfirmId = null; this.deleting = false;
        this.showToast('Table deleted', 'success');
      },
      error: () => { this.deleting = false; this.showToast('Failed to delete', 'error'); }
    });
  }

  getStatusClass(status: TableStatus): string {
    const map: Record<TableStatus, string> = {
      Available: 'status-available', Occupied: 'status-occupied',
      Reserved: 'status-reserved', Maintenance: 'status-maintenance'
    };
    return map[status];
  }

  getAreaLabel(area: DiningArea): string {
    return this.areaLabels[area] ?? area;
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3500);
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
