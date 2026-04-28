import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/pharmacy-shell/pharmacy-shell.component').then(m => m.PharmacyShellComponent),
    children: [
      { path: '', loadComponent: () => import('./components/pharmacy-home/pharmacy-home.component').then(m => m.PharmacyHomeComponent) },
      { path: 'medicines', loadComponent: () => import('./components/pharmacy-medicines/pharmacy-medicines.component').then(m => m.PharmacyMedicinesComponent) },
      { path: 'medicines/:id', loadComponent: () => import('./components/pharmacy-medicine-detail/pharmacy-medicine-detail.component').then(m => m.PharmacyMedicineDetailComponent) },
      { path: 'cart', loadComponent: () => import('./components/pharmacy-cart/pharmacy-cart.component').then(m => m.PharmacyCartComponent) },
      { path: 'checkout', loadComponent: () => import('./components/pharmacy-checkout/pharmacy-checkout.component').then(m => m.PharmacyCheckoutComponent) },
      { path: 'my-orders', loadComponent: () => import('./components/pharmacy-my-orders/pharmacy-my-orders.component').then(m => m.PharmacyMyOrdersComponent) },
      { path: 'prescription', loadComponent: () => import('./components/pharmacy-prescription/pharmacy-prescription.component').then(m => m.PharmacyPrescriptionComponent) },
      { path: 'ai-assistant', loadComponent: () => import('./components/pharmacy-ai-assistant/pharmacy-ai-assistant.component').then(m => m.PharmacyAiAssistantComponent) },
      { path: 'reviews', loadComponent: () => import('./components/pharmacy-reviews/pharmacy-reviews.component').then(m => m.PharmacyReviewsComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
