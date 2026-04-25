import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';
  currentUser: any;

  totalUsers = 0;
  recentUsers = 0;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.totalUsers = data.length;
        
        // Calculate recent users (e.g., created in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        this.recentUsers = data.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Ensure backend is running.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
