import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CmsShellComponent } from './components/cms-shell/cms-shell.component';
import { authGuard } from './guards/auth.guard';
import { cmsGuard } from './guards/cms.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ── Unified CMS Shell ─────────────────────────────────────────────────────
  {
    path: 'cms',
    component: CmsShellComponent,
    canActivate: [authGuard, cmsGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },

      // Overview
      { path: 'overview', loadComponent: () => import('./components/cms-overview/cms-overview.component').then(m => m.CmsOverviewComponent) },

      // ── Pharmacy section ────────────────────────────────────────────────
      { path: 'pharmacy/dashboard',     loadComponent: () => import('./components/pharmacy-cms-dashboard/pharmacy-cms-dashboard.component').then(m => m.PharmacyCmsDashboardComponent) },
      { path: 'pharmacy/medicines',     loadComponent: () => import('./components/pharmacy-cms-medicines/pharmacy-cms-medicines.component').then(m => m.PharmacyCmsMedicinesComponent) },
      { path: 'pharmacy/categories',    loadComponent: () => import('./components/pharmacy-cms-categories/pharmacy-cms-categories.component').then(m => m.PharmacyCmsCategoriesComponent) },
      { path: 'pharmacy/prescriptions', loadComponent: () => import('./components/pharmacy-cms-prescriptions/pharmacy-cms-prescriptions.component').then(m => m.PharmacyCmsPrescriptionsComponent) },
      { path: 'pharmacy/orders',        loadComponent: () => import('./components/pharmacy-cms-orders/pharmacy-cms-orders.component').then(m => m.PharmacyCmsOrdersComponent) },

      // ── Restaurant section ──────────────────────────────────────────────
      { path: 'restaurant/dashboard',   loadComponent: () => import('./components/restaurant-dashboard/restaurant-dashboard.component').then(m => m.RestaurantDashboardComponent) },
      { path: 'restaurant/list',        loadComponent: () => import('./components/restaurant-list/restaurant-list.component').then(m => m.RestaurantListComponent) },
      { path: 'restaurant/categories',  loadComponent: () => import('./components/category-management/category-management.component').then(m => m.CategoryManagementComponent) },
      { path: 'restaurant/menu-items',  loadComponent: () => import('./components/menu-items/menu-items.component').then(m => m.MenuItemsComponent) },
      { path: 'restaurant/tables',      loadComponent: () => import('./components/table-management/table-management.component').then(m => m.TableManagementComponent) },
      { path: 'restaurant/reservations',loadComponent: () => import('./components/reservation-management/reservation-management.component').then(m => m.ReservationManagementComponent) },

      // ── Users section ───────────────────────────────────────────────────
      { path: 'users',          loadComponent: () => import('./components/user-list/user-list.component').then(m => m.UserListComponent) },
      { path: 'users/new',      loadComponent: () => import('./components/user-form/user-form.component').then(m => m.UserFormComponent) },
      { path: 'users/edit/:id', loadComponent: () => import('./components/user-form/user-form.component').then(m => m.UserFormComponent) },
      { path: 'users/:id',      loadComponent: () => import('./components/user-detail/user-detail.component').then(m => m.UserDetailComponent) },

      // ── AI Assistant ─────────────────────────────────────────────────────
      { path: 'ai-assistant', loadComponent: () => import('./components/cms-ai-assistant/cms-ai-assistant.component').then(m => m.CmsAiAssistantComponent) },
    ]
  },

  // ── Customer Portal (restaurant) ──────────────────────────────────────────
  {
    path: 'portal',
    loadComponent: () => import('./components/customer-shell/customer-shell.component').then(m => m.CustomerShellComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',            loadComponent: () => import('./components/customer-home/customer-home.component').then(m => m.CustomerHomeComponent) },
      { path: 'restaurants',     loadComponent: () => import('./components/customer-restaurants/customer-restaurants.component').then(m => m.CustomerRestaurantsComponent) },
      { path: 'restaurant/:id',  loadComponent: () => import('./components/customer-menu/customer-menu.component').then(m => m.CustomerMenuComponent) },
      { path: 'book/:id',        loadComponent: () => import('./components/customer-booking/customer-booking.component').then(m => m.CustomerBookingComponent) },
      { path: 'my-reservations', loadComponent: () => import('./components/customer-reservations/customer-reservations.component').then(m => m.CustomerReservationsComponent) },
      { path: 'ai-assistant',    loadComponent: () => import('./components/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent) },
    ]
  },

  { path: '**', redirectTo: '/login' }
];
