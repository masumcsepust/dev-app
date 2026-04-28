import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService, Reservation, Restaurant, ReservationStatus } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

interface ReservationWithRestaurant extends Reservation {
  restaurantName?: string;
  restaurantId?: number;
}

@Component({
  selector: 'app-customer-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-reservations.component.html',
  styleUrls: ['./customer-reservations.component.css']
})
export class CustomerReservationsComponent implements OnInit {
  reservations: ReservationWithRestaurant[] = [];
  loading = true;
  error = '';
  cancellingId: number | null = null;
  cancelledIds = new Set<number>();

  private currentUser: any;

  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.loadReservations();
  }

  loadReservations() {
    this.loading = true;
    this.restaurantService.getRestaurants().pipe(
      switchMap(restaurants => {
        if (!restaurants.length) return of([] as ReservationWithRestaurant[]);
        return forkJoin(
          restaurants.map(r =>
            this.restaurantService.getReservations(r.id).pipe(
              catchError(() => of([] as Reservation[])),
              switchMap(reservations => {
                const mine = reservations
                  .filter(res => res.customerEmail === this.currentUser?.email)
                  .map(res => ({ ...res, restaurantName: r.name, restaurantId: r.id }));
                return of(mine);
              })
            )
          )
        );
      }),
      switchMap((arrays: any) => {
        const flat: ReservationWithRestaurant[] = Array.isArray(arrays) ? arrays.flat() : [];
        return of(flat.sort((a, b) =>
          new Date(b.reservationDateTime).getTime() - new Date(a.reservationDateTime).getTime()
        ));
      })
    ).subscribe({
      next: data => { this.reservations = data; this.loading = false; },
      error: () => { this.error = 'Failed to load reservations.'; this.loading = false; }
    });
  }

  cancelReservation(id: number) {
    this.cancellingId = id;
    this.restaurantService.cancelReservation(id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.cancelledIds.add(id);
        const r = this.reservations.find(r => r.id === id);
        if (r) r.status = 'Cancelled';
      },
      error: () => { this.cancellingId = null; }
    });
  }

  canCancel(r: ReservationWithRestaurant): boolean {
    if (r.status === 'Cancelled' || r.status === 'Completed' || r.status === 'NoShow') return false;
    return new Date(r.reservationDateTime) > new Date();
  }

  statusClass(status: ReservationStatus): string {
    const map: Record<string, string> = {
      Booked: 'status-booked',
      Seated: 'status-seated',
      Completed: 'status-completed',
      Cancelled: 'status-cancelled',
      NoShow: 'status-noshow',
    };
    return map[status] ?? '';
  }

  get upcoming(): ReservationWithRestaurant[] {
    return this.reservations.filter(r =>
      r.status !== 'Cancelled' && r.status !== 'Completed' && r.status !== 'NoShow' &&
      new Date(r.reservationDateTime) >= new Date()
    );
  }

  get past(): ReservationWithRestaurant[] {
    return this.reservations.filter(r =>
      r.status === 'Cancelled' || r.status === 'Completed' || r.status === 'NoShow' ||
      new Date(r.reservationDateTime) < new Date()
    );
  }
}
