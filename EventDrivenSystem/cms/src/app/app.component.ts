import { Component } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CMS Portal';

  showGlobalNav$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map((e: any) => !e.url.startsWith('/cms') && !e.url.startsWith('/portal')),
    startWith(!this.router.url.startsWith('/cms') && !this.router.url.startsWith('/portal'))
  );

  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isCms(): boolean {
    return this.authService.hasRole('CMS');
  }
}
