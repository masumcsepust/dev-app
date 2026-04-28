import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MedicineCategory { id: number; name: string; description: string; }
export interface Medicine {
  id: number; name: string; genericName: string; description: string;
  manufacturer: string; form: string; dosage: string; sideEffects: string;
  price: number; stockQuantity: number; isAvailable: boolean;
  requiresPrescription: boolean; imageUrl: string; categoryId: number | null;
  category: MedicineCategory | null;
}
export interface CartItem { medicine: Medicine; quantity: number; }
export interface PharmacyOrder {
  id: number; customerName: string; customerPhone: string; customerAddress: string;
  totalAmount: number; status: string; createdAt: string;
  items: { medicineId: number; medicineName: string; quantity: number; unitPrice: number; subtotal: number }[];
}
export interface Prescription {
  id: number; patientName: string; patientPhone: string; doctorName: string;
  status: string; notes: string; imageUrl: string; createdAt: string;
  items: { medicineName: string; quantity: number; dosageInstructions: string }[];
}
export interface ChatMessage { role: string; content: string; }

const CART_KEY = 'pharma_cart';
const API = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private _cart = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this._cart.asObservable();

  constructor(private http: HttpClient) {}

  // ── Catalogue ──────────────────────────────────────────────────────────────
  getCategories(): Observable<MedicineCategory[]> {
    return this.http.get<MedicineCategory[]>(`${API}/medicines/categories`);
  }
  getMedicines(search?: string, categoryId?: number): Observable<Medicine[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (categoryId) params['categoryId'] = String(categoryId);
    return this.http.get<Medicine[]>(`${API}/medicines`, { params });
  }
  getMedicine(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${API}/medicines/${id}`);
  }

  // ── Cart ───────────────────────────────────────────────────────────────────
  private loadCart(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  }
  private saveCart(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this._cart.next(items);
  }
  addToCart(medicine: Medicine, qty = 1) {
    const items = [...this._cart.value];
    const idx = items.findIndex(i => i.medicine.id === medicine.id);
    if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
    else items.push({ medicine, quantity: qty });
    this.saveCart(items);
  }
  removeFromCart(medicineId: number) {
    this.saveCart(this._cart.value.filter(i => i.medicine.id !== medicineId));
  }
  updateCartQty(medicineId: number, qty: number) {
    if (qty <= 0) { this.removeFromCart(medicineId); return; }
    this.saveCart(this._cart.value.map(i => i.medicine.id === medicineId ? { ...i, quantity: qty } : i));
  }
  clearCart() { this.saveCart([]); }
  get cartTotal(): number {
    return this._cart.value.reduce((s, i) => s + i.medicine.price * i.quantity, 0);
  }

  // ── Orders ─────────────────────────────────────────────────────────────────
  placeOrder(payload: object): Observable<PharmacyOrder> {
    return this.http.post<PharmacyOrder>(`${API}/pharmacy-orders`, payload);
  }
  getOrdersByPhone(phone: string): Observable<PharmacyOrder[]> {
    return this.http.get<PharmacyOrder[]>(`${API}/pharmacy-orders/by-phone/${phone}`);
  }

  // ── Prescriptions ──────────────────────────────────────────────────────────
  submitPrescription(formData: FormData): Observable<Prescription> {
    return this.http.post<Prescription>(`${API}/prescriptions`, formData);
  }
  getMyPrescriptions(phone: string): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${API}/prescriptions/by-phone/${phone}`);
  }

  // ── AI Chat ────────────────────────────────────────────────────────────────
  chat(messages: ChatMessage[], language: 'en' | 'bn' = 'en'): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${API}/ai/chat`, { messages, language });
  }
}
