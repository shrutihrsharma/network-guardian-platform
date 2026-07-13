import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  enabled: boolean;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <mat-nav-list>
      @for (item of items; track item.route) {
        <a
          mat-list-item
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
          [class.disabled]="!item.enabled"
        >
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.label }}</span>
        </a>
      }
    </mat-nav-list>
  `,
  styles: `
    mat-nav-list {
      padding-top: 0.75rem;
    }

    a {
      color: var(--app-text-muted);
      border-radius: 0.8rem;
      margin: 0.2rem 0.75rem;
    }

    a.active {
      background: var(--app-primary-soft);
      color: var(--app-text);
    }

    a.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavComponent {
  readonly items: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', enabled: true },
    { label: 'Devices', icon: 'dns', route: '/devices', enabled: true },
    { label: 'Incidents', icon: 'warning', route: '/incidents', enabled: true },
    { label: 'Lifecycle', icon: 'timeline', route: '/lifecycle', enabled: true },
    { label: 'Compliance', icon: 'verified_user', route: '/compliance', enabled: true },
    { label: 'Predictive Risk', icon: 'analytics', route: '/predictive-risk', enabled: true },
    { label: 'Decision History', icon: 'history', route: '/decision-history', enabled: true },
    { label: 'Settings', icon: 'settings', route: '/settings', enabled: true }
  ];
}
