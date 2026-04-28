import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService, Restaurant, RestaurantTable, Reservation, ReservationStatus } from '../../services/restaurant.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { PaginatePipe } from '../../shared/paginate.pipe';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginationComponent, PaginatePipe],
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.css']
})
export class ReservationManagementComponent implements OnInit {
  restaurants: Restaurant[] = [];
  selectedRestaurantId: number | null = null;
  tables: RestaurantTable[] = [];
  reservations: Reservation[] = [];
  page = 1;
  pageSize = 10;
  statusFilter: ReservationStatus | '' = '';
  dateFilter = '';
  loading = false;
  showModal = false;
  editingId: number | null = null;
  saving = false;
  cancelConfirmId: number | null = null;
  cancelling = false;
  toast = { show: false, message: '', type: 'success' };
  form: FormGroup;

  statuses: ReservationStatus[] = ['Booked', 'Seated', 'Completed', 'Cancelled', 'NoShow'];

  constructor(private restaurantService: RestaurantService, private fb: FormBuilder) {
    this.form = this.fb.group({
      tableId:             [null, Validators.required],
      customerName:        ['', [Validators.required, Validators.maxLength(100)]],
      customerPhone:       ['', [Validators.required]],
      customerEmail:       [''],
      reservationDateTime: ['', Validators.required],
      guestsCount:         [null, [Validators.required, Validators.min(1), Validators.max(20)]],
      specialRequest:      [''],
      status:              ['Booked'],
    });
  }

  ngOnInit() {
    this.restaurantService.getRestaurants().subscribe({
      next: r => {
        this.restaurants = r;
        if (r.length) { this.selectedRestaurantId = r[0].id; this.loadData(); }
      }
    });
  }

  onRestaurantChange(event: Event) {
    this.selectedRestaurantId = +((event.target as HTMLSelectElement).value);
    this.statusFilter = '';
    this.dateFilter = '';
    this.loadData();
  }

  loadData() {
    if (!this.selectedRestaurantId) return;
    this.loading = true;
    forkJoin([
      this.restaurantService.getTables(this.selectedRestaurantId).pipe(catchError(() => of([] as RestaurantTable[]))),
      this.restaurantService.getReservations(this.selectedRestaurantId).pipe(catchError(() => of([] as Reservation[])))
    ]).subscribe({
      next: ([tables, reservations]) => {
        this.tables = tables;
        this.reservations = reservations.sort((a, b) => new Date(b.reservationDateTime).getTime() - new Date(a.reservationDateTime).getTime());
        this.loading = false;
      },
      error: () => { this.showToast('Failed to load reservations', 'error'); this.loading = false; }
    });
  }

  get filteredReservations(): Reservation[] {
    return this.reservations.filter(r => {
      const matchStatus = !this.statusFilter || r.status === this.statusFilter;
      const matchDate = !this.dateFilter || r.reservationDateTime.startsWith(this.dateFilter);
      return matchStatus && matchDate;
    });
  }

  getStatusCounts(): Record<string, number> {
    const c: Record<string, number> = { Booked: 0, Seated: 0, Completed: 0, Cancelled: 0, NoShow: 0 };
    this.reservations.forEach(r => c[r.status] = (c[r.status] ?? 0) + 1);
    return c;
  }

  openAdd() {
    this.editingId = null;
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const dt = new Date(now.getTime() + 3600000).toISOString().slice(0, 16);
    this.form.reset({ status: 'Booked', reservationDateTime: dt });
    this.showModal = true;
  }

  openEdit(r: Reservation) {
    this.editingId = r.id;
    const dt = new Date(r.reservationDateTime).toISOString().slice(0, 16);
    this.form.patchValue({
      tableId: r.tableId, customerName: r.customerName, customerPhone: r.customerPhone,
      customerEmail: r.customerEmail, reservationDateTime: dt,
      guestsCount: r.guestsCount, specialRequest: r.specialRequest, status: r.status
    });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; this.form.reset({ status: 'Booked' }); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;

    if (this.editingId) {
      this.restaurantService.updateReservation(this.editingId, {
        reservationDateTime: new Date(v.reservationDateTime).toISOString(),
        guestsCount: v.guestsCount, specialRequest: v.specialRequest, status: v.status
      }).subscribe({
        next: updated => {
          const i = this.reservations.findIndex(r => r.id === this.editingId);
          if (i !== -1) this.reservations[i] = updated;
          this.saving = false; this.closeModal();
          this.showToast('Reservation updated', 'success');
        },
        error: () => { this.saving = false; this.showToast('Failed to update', 'error'); }
      });
    } else {
      this.restaurantService.createReservation({
        tableId: +v.tableId, customerName: v.customerName, customerPhone: v.customerPhone,
        customerEmail: v.customerEmail,
        reservationDateTime: new Date(v.reservationDateTime).toISOString(),
        guestsCount: v.guestsCount, specialRequest: v.specialRequest
      }).subscribe({
        next: created => {
          this.reservations = [created, ...this.reservations];
          this.saving = false; this.closeModal();
          this.showToast('Reservation created', 'success');
        },
        error: () => { this.saving = false; this.showToast('Failed to create', 'error'); }
      });
    }
  }

  confirmCancel(id: number) { this.cancelConfirmId = id; }
  dismissCancel() { this.cancelConfirmId = null; }

  doCancel() {
    if (!this.cancelConfirmId) return;
    this.cancelling = true;
    this.restaurantService.cancelReservation(this.cancelConfirmId).subscribe({
      next: () => {
        const i = this.reservations.findIndex(r => r.id === this.cancelConfirmId);
        if (i !== -1) this.reservations[i] = { ...this.reservations[i], status: 'Cancelled' };
        this.cancelConfirmId = null; this.cancelling = false;
        this.showToast('Reservation cancelled', 'success');
      },
      error: () => { this.cancelling = false; this.showToast('Failed to cancel', 'error'); }
    });
  }

  getTableLabel(tableId: number): string {
    return `Table ${this.tables.find(t => t.id === tableId)?.tableNumber ?? tableId}`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Booked: 'badge-blue', Seated: 'badge-purple', Completed: 'badge-green',
      Cancelled: 'badge-red', NoShow: 'badge-gray'
    };
    return map[status] ?? 'badge-gray';
  }

  formatDate(dt: string): string {
    return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(dt: string): string {
    return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
