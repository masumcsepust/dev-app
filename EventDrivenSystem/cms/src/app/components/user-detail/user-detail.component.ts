import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loading = true;
      this.userService.getUser(+idParam).subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load user details.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.error = 'Invalid user ID.';
    }
  }

  onEdit(): void {
    if (this.user) {
      this.router.navigate(['/users/edit', this.user.id]);
    }
  }

  onDelete(): void {
    if (this.user && confirm(`Are you sure you want to delete ${this.user.firstName}?`)) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.error = 'Failed to delete user.';
          console.error(err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
