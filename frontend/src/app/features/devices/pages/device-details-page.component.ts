import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { DeviceApiService } from '../../../core/services/device-api.service';
import { DeviceInventoryItem } from '../../../core/models/device.model';
import { DeviceContextStore } from '../services/device-context.store';
import { DeviceHeaderComponent } from '../components/device-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

interface DeviceTab {
  label: string;
  path: string;
}

@Component({
  selector: 'app-device-details-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DeviceHeaderComponent, EmptyStateComponent, MatTabsModule],
  template: `
    <section class="details-page">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a routerLink="/devices">Devices</a>
        <span>/</span>
        <span>{{ device()?.deviceName ?? 'Device Details' }}</span>
      </nav>

      @if (errorMessage()) {
        <app-empty-state title="Device unavailable" [description]="errorMessage()!" icon="error_outline" />
      } @else if (device(); as currentDevice) {
        <app-device-header [device]="currentDevice" />

        <nav mat-tab-nav-bar [tabPanel]="tabPanel" class="tab-nav" aria-label="Device sections">
          @for (tab of tabs; track tab.path) {
            <a
              mat-tab-link
              [routerLink]="tab.path"
              routerLinkActive
              #activeLink="routerLinkActive"
              [active]="activeLink.isActive"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              {{ tab.label }}
            </a>
          }
        </nav>

        <mat-tab-nav-panel #tabPanel>
          <router-outlet />
        </mat-tab-nav-panel>
      } @else {
        <app-empty-state title="Loading device context" description="Preparing selected device workspace." icon="hourglass_top" />
      }
    </section>
  `,
  styles: `
    .details-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--app-text-muted);
      font-size: 0.84rem;
    }

    .breadcrumb a {
      color: var(--app-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .tab-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.4rem;
      border: 1px solid var(--app-border);
      border-radius: 0.9rem;
      background: var(--app-surface);
    }

    .tab-nav a {
      text-decoration: none;
      color: var(--app-text-muted);
      font-weight: 600;
      padding: 0.48rem 0.85rem;
      border-radius: 0.7rem;
      transition: background 120ms ease;
      font-size: 0.84rem;
    }

    .tab-nav a.mdc-tab--active {
      background: var(--app-primary-soft);
      color: var(--app-text);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly deviceApi = inject(DeviceApiService);
  private readonly contextStore = inject(DeviceContextStore);

  protected readonly device = signal<DeviceInventoryItem | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly tabs: DeviceTab[] = [
    { label: 'Overview', path: 'overview' },
    { label: 'Incidents', path: 'incidents' },
    { label: 'Lifecycle', path: 'lifecycle' },
    { label: 'Topology', path: 'topology' },
    { label: 'Compliance', path: 'compliance' }
  ];

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const deviceId = params.get('deviceId');
        if (!deviceId) {
          this.errorMessage.set('Missing device identifier.');
          this.contextStore.setDevice(null);
          return;
        }

        this.device.set(null);
        this.errorMessage.set(null);

        this.deviceApi.getDevice(deviceId).subscribe({
          next: (device) => {
            this.device.set(device);
            this.contextStore.setDevice(device);
          },
          error: (error: Error) => {
            this.errorMessage.set(error.message);
            this.contextStore.setDevice(null);
          }
        });
      });
  }
}
