import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const GW = 'http://localhost:5000/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = new BehaviorSubject<AuthUser | null>(this.loadUser());
  user$ = this._user.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): AuthUser | null { return this._user.value; }
  get isLoggedIn(): boolean { return !!this._user.value; }

  getToken(): string | null { return localStorage.getItem('ph_token'); }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${GW}/login`, { email, password }).pipe(
      tap(r => this.store(r))
    );
  }

  register(data: { firstName: string; lastName: string; email: string; phoneNumber: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${GW}/register`, { ...data, userType: 0 }).pipe(
      tap(r => this.store(r))
    );
  }

  logout(): void {
    localStorage.removeItem('ph_token');
    localStorage.removeItem('ph_refresh');
    localStorage.removeItem('ph_user');
    this._user.next(null);
  }

  private store(r: AuthResponse): void {
    localStorage.setItem('ph_token', r.accessToken);
    localStorage.setItem('ph_refresh', r.refreshToken);
    localStorage.setItem('ph_user', JSON.stringify(r.user));
    this._user.next(r.user);
  }

  private loadUser(): AuthUser | null {
    try { return JSON.parse(localStorage.getItem('ph_user') || 'null'); } catch { return null; }
  }
}
