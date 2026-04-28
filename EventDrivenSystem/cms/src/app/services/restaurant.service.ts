import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
export type DiningArea = 'GroundFloor' | 'Rooftop' | 'FamilyZone' | 'AC_Room';
export type ReservationStatus = 'Booked' | 'Seated' | 'Completed' | 'Cancelled' | 'NoShow';

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  imageUrl: string;
  description: string;
  address: string;
  ownerId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodCategory {
  id: number;
  name: string;
  description: string;
  restaurantId: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number | null;
  restaurantId: number;
  isAvailable: boolean;
  category?: FoodCategory;
}

export interface RestaurantTable {
  id: number;
  restaurantId: number;
  tableNumber: number;
  seatingCapacity: number;
  status: TableStatus;
  area: DiningArea;
}

export interface Reservation {
  id: number;
  tableId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reservationDateTime: string;
  guestsCount: number;
  specialRequest: string;
  status: ReservationStatus;
  table?: { id: number; tableNumber: number };
}

export interface DashboardStats {
  restaurants: Restaurant[];
  totalItems: number;
  totalTables: number;
  totalReservations: number;
  tableStats: { available: number; occupied: number; reserved: number; maintenance: number };
  recentReservations: Reservation[];
  popularItems: MenuItem[];
}

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private apiUrl = 'http://localhost:5000/api';
  private get headers() { return new HttpHeaders({ 'Content-Type': 'application/json' }); }

  constructor(private http: HttpClient) {}

  // ── Restaurants ─────────────────────────────────────────────────────────────
  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/restaurants`);
  }

  getRestaurant(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/restaurants/${id}`);
  }

  createRestaurant(dto: { name: string; cuisine: string; address: string; imageUrl: string; description: string; ownerId: number }): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.apiUrl}/restaurants`, dto, { headers: this.headers });
  }

  updateRestaurant(id: number, dto: { name: string; cuisine: string; address: string; imageUrl: string; description: string }): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/restaurants/${id}`, dto, { headers: this.headers });
  }

  deleteRestaurant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/restaurants/${id}`);
  }

  // ── Categories ───────────────────────────────────────────────────────────────
  getCategories(restaurantId: number): Observable<FoodCategory[]> {
    return this.http.get<FoodCategory[]>(`${this.apiUrl}/restaurant-categories/restaurant/${restaurantId}`);
  }

  createCategory(dto: { restaurantId: number; name: string; description: string }): Observable<FoodCategory> {
    return this.http.post<FoodCategory>(`${this.apiUrl}/restaurant-categories`, dto, { headers: this.headers });
  }

  updateCategory(id: number, dto: { name: string; description: string }): Observable<FoodCategory> {
    return this.http.put<FoodCategory>(`${this.apiUrl}/restaurant-categories/${id}`, dto, { headers: this.headers });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/restaurant-categories/${id}`);
  }

  // ── Menu Items ───────────────────────────────────────────────────────────────
  getMenuItems(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menuitems/restaurant/${restaurantId}`);
  }

  uploadMenuItemImage(file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/menuitems/upload-image`, form);
  }

  createMenuItem(dto: { restaurantId: number; categoryId?: number | null; name: string; description: string; price: number; imageUrl?: string; isAvailable?: boolean }): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.apiUrl}/menuitems`, { ...dto, isAvailable: dto.isAvailable ?? true }, { headers: this.headers });
  }

  updateMenuItem(id: number, dto: { restaurantId: number; categoryId?: number | null; name: string; description: string; price: number; imageUrl?: string; isAvailable?: boolean }): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/menuitems/${id}`, dto, { headers: this.headers });
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/menuitems/${id}`);
  }

  // ── Tables ───────────────────────────────────────────────────────────────────
  getTables(restaurantId: number): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(`${this.apiUrl}/tables/restaurant/${restaurantId}`);
  }

  createTable(dto: { restaurantId: number; tableNumber: number; seatingCapacity: number; status?: TableStatus; area?: DiningArea }): Observable<RestaurantTable> {
    return this.http.post<RestaurantTable>(`${this.apiUrl}/tables`, dto, { headers: this.headers });
  }

  updateTable(id: number, dto: { tableNumber: number; seatingCapacity: number; status: TableStatus; area: DiningArea }): Observable<RestaurantTable> {
    return this.http.put<RestaurantTable>(`${this.apiUrl}/tables/${id}`, dto, { headers: this.headers });
  }

  deleteTable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tables/${id}`);
  }

  // ── Reservations ─────────────────────────────────────────────────────────────
  getReservations(restaurantId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/restaurant/${restaurantId}`);
  }

  createReservation(dto: { tableId: number; customerName: string; customerPhone: string; customerEmail?: string; reservationDateTime: string; guestsCount: number; specialRequest?: string }): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, {
      ...dto,
      customerEmail: dto.customerEmail || '',
      specialRequest: dto.specialRequest || '',
    }, { headers: this.headers });
  }

  updateReservation(id: number, dto: { reservationDateTime: string; guestsCount: number; specialRequest?: string; status?: ReservationStatus }): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/reservations/${id}`, dto, { headers: this.headers });
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/reservations/${id}/cancel`, null);
  }

  // ── AI Chat ──────────────────────────────────────────────────────────────────
  chat(messages: { role: string; content: string }[]): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.apiUrl}/ai/chat`, { messages }, { headers: this.headers });
  }

  // ── Dashboard Aggregation ────────────────────────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.getRestaurants().pipe(
      switchMap(restaurants => {
        if (!restaurants.length) {
          return of({
            restaurants,
            totalItems: 0, totalTables: 0, totalReservations: 0,
            tableStats: { available: 0, occupied: 0, reserved: 0, maintenance: 0 },
            recentReservations: [], popularItems: []
          });
        }
        return forkJoin([
          forkJoin(restaurants.map(r => this.getMenuItems(r.id).pipe(catchError(() => of([] as MenuItem[]))))),
          forkJoin(restaurants.map(r => this.getTables(r.id).pipe(catchError(() => of([] as RestaurantTable[]))))),
          forkJoin(restaurants.map(r => this.getReservations(r.id).pipe(catchError(() => of([] as Reservation[])))))
        ]).pipe(
          map(([itemArrays, tableArrays, reservationArrays]) => {
            const allItems = itemArrays.flat();
            const allTables = tableArrays.flat();
            const allReservations = reservationArrays.flat();
            return {
              restaurants,
              totalItems: allItems.length,
              totalTables: allTables.length,
              totalReservations: allReservations.length,
              tableStats: {
                available: allTables.filter(t => t.status === 'Available').length,
                occupied: allTables.filter(t => t.status === 'Occupied').length,
                reserved: allTables.filter(t => t.status === 'Reserved').length,
                maintenance: allTables.filter(t => t.status === 'Maintenance').length,
              },
              recentReservations: [...allReservations]
                .sort((a, b) => new Date(b.reservationDateTime).getTime() - new Date(a.reservationDateTime).getTime())
                .slice(0, 8),
              popularItems: allItems.filter(i => i.isAvailable).slice(0, 6),
            };
          })
        );
      })
    );
  }
}
