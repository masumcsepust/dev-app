import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService, Restaurant, RestaurantTable } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-customer-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './customer-booking.component.html',
  styleUrls: ['./customer-booking.component.css']
})
export class CustomerBookingComponent implements OnInit {
  restaurantId!: number;
  restaurant: Restaurant | null = null;
  tables: RestaurantTable[] = [];
  loading = true;
  submitting = false;
  success = false;
  error = '';

  form!: FormGroup;
  currentUser: any;

  readonly areas: Record<string, string> = {
    GroundFloor: 'Ground Floor',
    Rooftop: 'Rooftop',
    FamilyZone: 'Family Zone',
    AC_Room: 'AC Room',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));

    this.form = this.fb.group({
      tableId: ['', Validators.required],
      reservationDate: ['', Validators.required],
      reservationTime: ['', Validators.required],
      guestsCount: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      customerName: [
        `${this.currentUser?.firstName ?? ''} ${this.currentUser?.lastName ?? ''}`.trim(),
        Validators.required
      ],
      customerPhone: ['', Validators.required],
      customerEmail: [this.currentUser?.email ?? '', [Validators.required, Validators.email]],
      specialRequest: [''],
    });

    forkJoin({
      restaurant: this.restaurantService.getRestaurant(this.restaurantId),
      tables: this.restaurantService.getTables(this.restaurantId),
    }).subscribe({
      next: ({ restaurant, tables }) => {
        this.restaurant = restaurant;
        this.tables = tables.filter(t => t.status === 'Available');
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load booking details.'; this.loading = false; }
    });
  }

  get availableTables(): RestaurantTable[] {
    const guests = this.form.get('guestsCount')?.value;
    return guests ? this.tables.filter(t => t.seatingCapacity >= guests) : this.tables;
  }

  getAreaLabel(area: string): string {
    return this.areas[area] ?? area;
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.error = '';

    const v = this.form.value;
    const dt = `${v.reservationDate}T${v.reservationTime}:00`;

    this.restaurantService.createReservation({
      tableId: Number(v.tableId),
      customerName: v.customerName,
      customerPhone: v.customerPhone,
      customerEmail: v.customerEmail,
      reservationDateTime: dt,
      guestsCount: v.guestsCount,
      specialRequest: v.specialRequest,
    }).subscribe({
      next: () => { this.submitting = false; this.success = true; },
      error: () => { this.submitting = false; this.error = 'Booking failed. Please try again.'; }
    });
  }

  goToReservations() {
    this.router.navigate(['/portal/my-reservations']);
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
