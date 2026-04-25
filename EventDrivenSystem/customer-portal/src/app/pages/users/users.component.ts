import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  users: UserProfile[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: 'Customer' },
    { name: 'Mia Lee', email: 'mia.lee@example.com', role: 'Customer' },
    { name: 'Sam Carter', email: 'sam.carter@example.com', role: 'Restaurant Owner' }
  ];

  newUser: UserProfile = { name: '', email: '', role: 'Customer' };

  addUser() {
    if (!this.newUser.name || !this.newUser.email) {
      return;
    }

    this.users = [...this.users, { ...this.newUser }];
    this.newUser = { name: '', email: '', role: 'Customer' };
  }
}
