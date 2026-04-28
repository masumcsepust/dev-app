import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cms-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cms-dashboard.component.html',
  styleUrls: ['./cms-dashboard.component.css']
})
export class CmsDashboardComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }
}
