import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { RestaurantComponent } from './views/restaurant/restaurant.component';
import { CheckoutComponent } from './views/checkout/checkout.component';
import { OrderConfirmationComponent } from './views/order-confirmation/order-confirmation.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'restaurant/:id', component: RestaurantComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'confirmation', component: OrderConfirmationComponent },
  { path: '**', redirectTo: '' }
];
