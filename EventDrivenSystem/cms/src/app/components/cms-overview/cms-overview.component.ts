import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PharmacyService } from '../../services/pharmacy.service';
import { RestaurantService } from '../../services/restaurant.service';
import { UserService } from '../../services/user.service';

interface ServiceCard {
  label: string; color: string; icon: string;
  stats: { label: string; value: number | string; sub?: string }[];
  link: string; linkLabel: string;
}

@Component({
  selector: 'app-cms-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="overview-page">
      <div class="page-header">
        <h1>Platform Overview</h1>
        <p>Live stats across all services</p>
      </div>

      <div *ngIf="loading" class="skeleton-grid">
        <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
      </div>

      <div class="services-grid" *ngIf="!loading">
        <div *ngFor="let card of cards" class="service-card" [class]="'sc-' + card.color">
          <div class="sc-header">
            <div class="sc-icon" [class]="'icon-' + card.color">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="card.icon"/>
              </svg>
            </div>
            <div>
              <div class="sc-title">{{ card.label }}</div>
              <div class="sc-sub">Service</div>
            </div>
          </div>
          <div class="sc-stats">
            <div *ngFor="let stat of card.stats" class="stat-item">
              <span class="stat-val">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
              <span class="stat-sub" *ngIf="stat.sub">{{ stat.sub }}</span>
            </div>
          </div>
          <a [routerLink]="card.link" class="sc-btn" [class]="'btn-' + card.color">
            {{ card.linkLabel }} →
          </a>
        </div>
      </div>

      <div class="quick-links" *ngIf="!loading">
        <h2>Quick Actions</h2>
        <div class="ql-grid">
          <a routerLink="/cms/pharmacy/medicines" class="ql-item green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16m8-8H4"/></svg>
            Add Medicine
          </a>
          <a routerLink="/cms/pharmacy/orders" class="ql-item green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            Pharmacy Orders
          </a>
          <a routerLink="/cms/pharmacy/prescriptions" class="ql-item green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Prescriptions
          </a>
          <a routerLink="/cms/restaurant/list" class="ql-item orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16m8-8H4"/></svg>
            Add Restaurant
          </a>
          <a routerLink="/cms/restaurant/reservations" class="ql-item orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Reservations
          </a>
          <a routerLink="/cms/users" class="ql-item blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Manage Users
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-page { max-width: 1200px; width: 100%; }
    .page-header { margin-bottom: 1.75rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin: 0 0 .25rem; }
    .page-header p { color: #64748b; font-size: .875rem; margin: 0; }

    .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
    @media (max-width: 900px) { .services-grid { grid-template-columns: 1fr; } }

    .service-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      border: 1.5px solid #e2e8f0;
      transition: transform .2s, box-shadow .2s;
    }
    .service-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
    .sc-green { border-top: 3px solid #34d399; }
    .sc-orange { border-top: 3px solid #fb923c; }
    .sc-blue { border-top: 3px solid #60a5fa; }

    .sc-header { display: flex; align-items: center; gap: .85rem; margin-bottom: 1.25rem; }
    .sc-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .sc-icon svg { width: 22px; height: 22px; }
    .icon-green { background: #d1fae5; color: #059669; }
    .icon-orange { background: #ffedd5; color: #ea580c; }
    .icon-blue { background: #dbeafe; color: #2563eb; }
    .sc-title { font-size: 1rem; font-weight: 700; color: #1e293b; }
    .sc-sub { font-size: .72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }

    .sc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-bottom: 1.25rem; }
    .stat-item { background: #f8fafc; border-radius: 10px; padding: .75rem; }
    .stat-val { display: block; font-size: 1.5rem; font-weight: 800; color: #1e293b; line-height: 1; }
    .stat-label { display: block; font-size: .72rem; color: #64748b; margin-top: .25rem; }
    .stat-sub { display: block; font-size: .68rem; color: #94a3b8; }

    .sc-btn {
      display: block; text-align: center;
      padding: .6rem 1rem;
      border-radius: 10px;
      font-size: .82rem; font-weight: 600;
      text-decoration: none;
      transition: all .15s;
    }
    .btn-green { background: #d1fae5; color: #059669; }
    .btn-green:hover { background: #059669; color: #fff; }
    .btn-orange { background: #ffedd5; color: #ea580c; }
    .btn-orange:hover { background: #ea580c; color: #fff; }
    .btn-blue { background: #dbeafe; color: #2563eb; }
    .btn-blue:hover { background: #2563eb; color: #fff; }

    .quick-links h2 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; }
    .ql-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: .75rem; }
    @media (max-width: 900px) { .ql-grid { grid-template-columns: repeat(2, 1fr); } }
    .ql-item {
      display: flex; flex-direction: column; align-items: center; gap: .5rem;
      padding: 1rem .75rem; border-radius: 12px;
      font-size: .78rem; font-weight: 600;
      text-decoration: none; text-align: center;
      transition: all .15s;
    }
    .ql-item svg { width: 20px; height: 20px; }
    .ql-item.green { background: #d1fae5; color: #059669; }
    .ql-item.green:hover { background: #059669; color: #fff; }
    .ql-item.orange { background: #ffedd5; color: #ea580c; }
    .ql-item.orange:hover { background: #ea580c; color: #fff; }
    .ql-item.blue { background: #dbeafe; color: #2563eb; }
    .ql-item.blue:hover { background: #2563eb; color: #fff; }

    .skeleton-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
    .skeleton-card { height: 240px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; border-radius: 16px; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class CmsOverviewComponent implements OnInit {
  loading = true;
  cards: ServiceCard[] = [];

  constructor(
    private pharmacy: PharmacyService,
    private restaurant: RestaurantService,
    private users: UserService
  ) {}

  ngOnInit() {
    forkJoin({
      medicines: this.pharmacy.getMedicines({}).pipe(catchError(() => of([]))),
      categories: this.pharmacy.getCategories().pipe(catchError(() => of([]))),
      orders: this.pharmacy.getOrders().pipe(catchError(() => of([]))),
      prescriptions: this.pharmacy.getPrescriptions().pipe(catchError(() => of([]))),
      restaurants: this.restaurant.getRestaurants().pipe(catchError(() => of([]))),
      userList: this.users.getUsers().pipe(catchError(() => of([]))),
    }).subscribe(({ medicines, categories, orders, prescriptions, restaurants, userList }) => {
      const pending = (prescriptions as any[]).filter(p => p.status === 'Pending').length;
      const lowStock = (medicines as any[]).filter((m: any) => m.stockQuantity < 10).length;

      this.cards = [
        {
          label: 'Pharmacy', color: 'green',
          icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
          stats: [
            { label: 'Medicines', value: (medicines as any[]).length, sub: `${lowStock} low stock` },
            { label: 'Categories', value: (categories as any[]).length },
            { label: 'Orders', value: (orders as any[]).length },
            { label: 'Prescriptions', value: (prescriptions as any[]).length, sub: `${pending} pending` },
          ],
          link: '/cms/pharmacy/dashboard', linkLabel: 'Open Pharmacy CMS'
        },
        {
          label: 'Restaurant', color: 'orange',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
          stats: [
            { label: 'Restaurants', value: (restaurants as any[]).length },
            { label: 'Active', value: (restaurants as any[]).filter((r: any) => r.isActive).length },
            { label: 'Cuisines', value: '—' },
            { label: 'Tables', value: '—' },
          ],
          link: '/cms/restaurant/dashboard', linkLabel: 'Open Restaurant CMS'
        },
        {
          label: 'Users', color: 'blue',
          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
          stats: [
            { label: 'Total Users', value: (userList as any[]).length },
            { label: 'Admins', value: (userList as any[]).filter((u: any) => u.userType === 1 || u.userType === 'Admin').length },
            { label: 'Customers', value: (userList as any[]).filter((u: any) => u.userType === 0 || u.userType === 'Customer').length },
            { label: 'New (7d)', value: (userList as any[]).filter((u: any) => { const d = new Date(); d.setDate(d.getDate()-7); return new Date(u.createdAt) >= d; }).length },
          ],
          link: '/cms/users', linkLabel: 'Manage Users'
        }
      ];
      this.loading = false;
    });
  }
}
