import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type MedicineForm = 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Drops' | 'Inhaler' | 'Other';
export type PrescriptionStatus = 'Pending' | 'Approved' | 'Dispensed' | 'Rejected';
export type OrderStatus = 'Placed' | 'Processing' | 'Ready' | 'Delivered' | 'Cancelled';

export interface MedicineCategory {
  id: number;
  name: string;
  description: string;
}

export interface Medicine {
  id: number;
  name: string;
  genericName: string;
  manufacturer: string;
  description: string;
  sideEffects: string;
  dosage: string;
  form: MedicineForm;
  price: number;
  stockQuantity: number;
  requiresPrescription: boolean;
  isAvailable: boolean;
  imageUrl: string;
  categoryId: number | null;
  category?: MedicineCategory;
}

export interface PrescriptionItem { id: number; medicineId: number; quantity: number; medicine?: Medicine; }
export interface Prescription {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  doctorName: string;
  notes: string;
  imageUrl: string;
  status: PrescriptionStatus;
  createdAt: string;
  updatedAt: string;
  items: PrescriptionItem[];
}

export interface PharmacyOrderItem { id: number; medicineId: number; medicineName: string; quantity: number; unitPrice: number; }
export interface PharmacyOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: PharmacyOrderItem[];
}

export interface CartItem { medicine: Medicine; quantity: number; }

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  readonly apiUrl = 'http://localhost:5000/api';
  private get headers() { return new HttpHeaders({ 'Content-Type': 'application/json' }); }

  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ── Categories ──────────────────────────────────────────────────────────────
  getCategories(): Observable<MedicineCategory[]> {
    return this.http.get<MedicineCategory[]>(`${this.apiUrl}/categories`);
  }
  createCategory(dto: { name: string; description: string }): Observable<MedicineCategory> {
    return this.http.post<MedicineCategory>(`${this.apiUrl}/categories`, dto, { headers: this.headers });
  }
  updateCategory(id: number, dto: { name: string; description: string }): Observable<MedicineCategory> {
    return this.http.put<MedicineCategory>(`${this.apiUrl}/categories/${id}`, dto, { headers: this.headers });
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // ── Medicines ────────────────────────────────────────────────────────────────
  getMedicines(params?: { categoryId?: number; requiresPrescription?: boolean; search?: string }): Observable<Medicine[]> {
    let p = new HttpParams();
    if (params?.categoryId != null) p = p.set('categoryId', params.categoryId);
    if (params?.requiresPrescription != null) p = p.set('requiresPrescription', params.requiresPrescription);
    if (params?.search) p = p.set('search', params.search);
    return this.http.get<Medicine[]>(`${this.apiUrl}/medicines`, { params: p });
  }
  getMedicine(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/medicines/${id}`);
  }
  createMedicine(dto: any): Observable<Medicine> {
    return this.http.post<Medicine>(`${this.apiUrl}/medicines`, dto, { headers: this.headers });
  }
  updateMedicine(id: number, dto: any): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/medicines/${id}`, dto, { headers: this.headers });
  }
  deleteMedicine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/medicines/${id}`);
  }
  uploadMedicineImage(file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/medicines/upload-image`, form);
  }

  // ── Prescriptions ────────────────────────────────────────────────────────────
  getPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/prescriptions`);
  }
  createPrescription(dto: any): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.apiUrl}/prescriptions`, dto, { headers: this.headers });
  }
  updatePrescriptionStatus(id: number, status: string): Observable<Prescription> {
    return this.http.patch<Prescription>(`${this.apiUrl}/prescriptions/${id}/status`, { status }, { headers: this.headers });
  }
  uploadPrescriptionImage(file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/prescriptions/upload-image`, form);
  }

  // ── Orders ───────────────────────────────────────────────────────────────────
  getOrders(): Observable<PharmacyOrder[]> {
    return this.http.get<PharmacyOrder[]>(`${this.apiUrl}/orders`);
  }
  getOrder(id: number): Observable<PharmacyOrder> {
    return this.http.get<PharmacyOrder>(`${this.apiUrl}/orders/${id}`);
  }
  createOrder(dto: any): Observable<PharmacyOrder> {
    return this.http.post<PharmacyOrder>(`${this.apiUrl}/orders`, dto, { headers: this.headers });
  }
  updateOrderStatus(id: number, status: string): Observable<PharmacyOrder> {
    return this.http.patch<PharmacyOrder>(`${this.apiUrl}/orders/${id}/status`, { status }, { headers: this.headers });
  }

  // ── AI Chat ──────────────────────────────────────────────────────────────────
  chat(messages: { role: string; content: string }[]): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.apiUrl}/ai/chat`, { messages }, { headers: this.headers });
  }

  // ── Cart (localStorage) ──────────────────────────────────────────────────────
  get cartItems(): CartItem[] { return this.cartSubject.value; }

  addToCart(medicine: Medicine, quantity = 1) {
    const items = [...this.cartItems];
    const existing = items.find(i => i.medicine.id === medicine.id);
    if (existing) existing.quantity += quantity;
    else items.push({ medicine, quantity });
    this.saveCart(items);
  }

  updateCartQty(medicineId: number, quantity: number) {
    const items = this.cartItems.map(i =>
      i.medicine.id === medicineId ? { ...i, quantity } : i
    ).filter(i => i.quantity > 0);
    this.saveCart(items);
  }

  removeFromCart(medicineId: number) {
    this.saveCart(this.cartItems.filter(i => i.medicine.id !== medicineId));
  }

  clearCart() { this.saveCart([]); }

  get cartTotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.medicine.price * i.quantity, 0);
  }

  get cartCount(): number {
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  private saveCart(items: CartItem[]) {
    localStorage.setItem('pharmacy_cart', JSON.stringify(items));
    this.cartSubject.next(items);
  }

  private loadCart(): CartItem[] {
    try { return JSON.parse(localStorage.getItem('pharmacy_cart') || '[]'); } catch { return []; }
  }
}
