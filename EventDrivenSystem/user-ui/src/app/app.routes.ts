import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CmsDashboardComponent } from './components/cms-dashboard/cms-dashboard.component';
import { RestaurantFormComponent } from './components/restaurant-form/restaurant-form.component';
import { authGuard } from './guards/auth.guard';
import { cmsGuard } from './guards/cms.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'cms', component: CmsDashboardComponent, canActivate: [authGuard, cmsGuard] },
  { path: 'cms/restaurants', component: RestaurantFormComponent, canActivate: [authGuard, cmsGuard] },
  { path: 'users', component: UserListComponent, canActivate: [authGuard] },
  { path: 'users/new', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'users/edit/:id', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [authGuard] }
];
