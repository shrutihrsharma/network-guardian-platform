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
    <div class="sidenav-inner">
      <div class="sidenav-section-label">WORKSPACE</div>
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

      <div class="sidenav-divider"></div>

      <div class="ai-status-card">
        <div class="ai-status-dot"></div>
        <div class="ai-status-text">
          <span class="ai-status-label">AI Engine Online</span>
          <span class="ai-status-model">Model: ng-forecaster · v2.0</span>
          <span class="ai-status-confidence">Confidence 95% · live</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .sidenav-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem 0 1.25rem;
    }

    .sidenav-section-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--app-text-muted);
      padding: 0 1.25rem 0.6rem;
    }

    mat-nav-list {
      padding-top: 0;
      flex: 1;
    }

    a {
      color: var(--app-text-secondary);
      border-radius: var(--app-radius-sm);
      margin: 0.12rem 0.75rem;
      transition: background 0.15s, color 0.15s;
      font-size: 0.88rem;
      font-weight: 500;
    }

    a:hover:not(.active) {
      background: var(--app-surface-strong) !important;
      color: var(--app-text);
    }

    a.active {
      background: var(--app-primary-soft) !important;
      color: var(--app-primary) !important;
      border-left: 2px solid var(--app-primary);
      padding-left: calc(1rem - 2px);
    }

    a.active mat-icon {
      color: var(--app-primary) !important;
    }

    a.disabled {
      opacity: 0.4;
      pointer-events: none;
    }

    .sidenav-divider {
      height: 1px;
      background: var(--app-border);
      margin: 0.75rem 1.25rem;
    }

    .ai-status-card {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      margin: 0 0.75rem;
      padding: 0.8rem 1rem;
      background: var(--app-surface-strong);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
    }

    .ai-status-dot {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 50%;
      background: var(--app-success);
      box-shadow: 0 0 6px var(--app-success);
      flex-shrink: 0;
      margin-top: 0.15rem;
    }

    .ai-status-text {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .ai-status-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--app-text);
    }

    .ai-status-model,
    .ai-status-confidence {
      font-size: 0.68rem;
      color: var(--app-text-muted);
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
