import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.currentUserValue) {
      if (this.authService.hasRole('CMS')) {
        this.router.navigate(['/cms']);
      } else {
        this.router.navigate(['/portal']);
      }
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        if (this.authService.hasRole('CMS')) {
          const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
          this.router.navigateByUrl(returnUrl || '/cms');
        } else if (this.authService.hasRole('Customer')) {
          const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
          this.router.navigateByUrl(returnUrl || '/portal');
        } else {
          this.authService.logout();
          this.error = 'Access denied. Unknown user role.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid email or password';
        this.loading = false;
      }
    });
  }

  createDefaultCmsUser() {
    this.loading = true;
    this.error = '';

    const defaultUser = {
      firstName: 'CMS',
      lastName: 'Admin',
      email: 'cms.admin@cmsportal.local',
      phoneNumber: '+10000000001',
      password: 'Password123!',
      userType: 'CMS'
    };

    this.authService.register(defaultUser).subscribe({
      next: () => {
        this.router.navigate(['/cms']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not create CMS user automatically.';
        this.loading = false;
      }
    });
  }
}
