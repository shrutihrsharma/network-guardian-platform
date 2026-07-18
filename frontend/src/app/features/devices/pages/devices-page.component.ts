import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceApiService } from '../../../core/services/device-api.service';
import { DeviceFilters, DeviceInventoryItem } from '../../../core/models/device.model';
import { FilterFieldDefinition, FilterPanelComponent, FilterPanelState } from '../../../shared/components/filter-panel.component';
import { DeviceTableComponent } from '../components/device-table.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

type SummaryFilter = 'healthy' | 'critical' | 'lifecycleRisk' | 'complianceIssues';

@Component({
  selector: 'app-devices-page',
  standalone: true,
  imports: [
    FilterPanelComponent,
    DeviceTableComponent,
    EmptyStateComponent
  ],
  template: `
    <section class="devices-page">
      <h1 class="devices-heading">Devices</h1>

      @if (errorMessage()) {
        <app-empty-state title="Inventory unavailable" [description]="errorMessage()!" icon="error_outline" />
      } @else {
        <app-filter-panel
          [compact]="true"
          [fields]="filterFields()"
          [state]="filterState()"
          (stateChange)="filterState.set($event)"
          (resetClicked)="resetFilters()"
        />

        <section class="devices-summary" aria-label="Device inventory summary">
          <span class="devices-summary__count">Showing {{ filteredDevices().length }} Devices</span>

          <button
            type="button"
            class="summary-chip"
            [class.is-active]="activeSummaryFilter() === 'healthy'"
            (click)="toggleSummaryFilter('healthy')"
          >
            <span class="summary-dot summary-dot--healthy"></span>
            Healthy ({{ healthyCount() }})
          </button>

          <button
            type="button"
            class="summary-chip"
            [class.is-active]="activeSummaryFilter() === 'critical'"
            (click)="toggleSummaryFilter('critical')"
          >
            <span class="summary-dot summary-dot--critical"></span>
            Critical ({{ criticalCount() }})
          </button>

          <button
            type="button"
            class="summary-chip"
            [class.is-active]="activeSummaryFilter() === 'lifecycleRisk'"
            (click)="toggleSummaryFilter('lifecycleRisk')"
          >
            <span class="summary-dot summary-dot--warning"></span>
            Lifecycle Risk ({{ lifecycleRiskCount() }})
          </button>

          <button
            type="button"
            class="summary-chip"
            [class.is-active]="activeSummaryFilter() === 'complianceIssues'"
            (click)="toggleSummaryFilter('complianceIssues')"
          >
            <span class="summary-dot summary-dot--info"></span>
            Compliance Issues ({{ complianceIssueCount() }})
          </button>
        </section>

        <app-device-table
          [devices]="filteredDevices()"
          [isLoading]="isLoading()"
          (openDetails)="openDevice($event)"
        />
      }
    </section>
  `,
  styles: `
    .devices-page {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }

    .devices-heading {
      margin: 0;
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--app-text);
      line-height: 1.2;
    }

    .devices-summary {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.55rem;
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--app-border);
      border-radius: 0.75rem;
      background: var(--app-surface);
    }

    .devices-summary__count {
      color: var(--app-text-muted);
      font-size: 0.82rem;
      margin-right: 0.2rem;
    }

    .summary-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.72);
      color: var(--app-text);
      padding: 0.32rem 0.6rem;
      font-size: 0.78rem;
      line-height: 1;
      cursor: pointer;
      transition: border-color 140ms ease, background-color 140ms ease;
    }

    .summary-chip:hover {
      border-color: rgba(245, 158, 11, 0.45);
      background: rgba(148, 163, 184, 0.12);
    }

    .summary-chip.is-active {
      border-color: rgba(245, 158, 11, 0.7);
      background: rgba(245, 158, 11, 0.14);
      color: #fbbf24;
    }

    .summary-dot {
      width: 0.48rem;
      height: 0.48rem;
      border-radius: 50%;
      display: inline-block;
      flex: 0 0 auto;
    }

    .summary-dot--healthy {
      background: var(--app-success);
    }

    .summary-dot--critical {
      background: #ef4444;
    }

    .summary-dot--warning {
      background: var(--app-warning);
    }

    .summary-dot--info {
      background: #3b82f6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicesPageComponent {
  private readonly deviceApi = inject(DeviceApiService);
  private readonly router = inject(Router);

  protected readonly devices = signal<DeviceInventoryItem[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly activeSummaryFilter = signal<SummaryFilter | null>(null);

  protected readonly filterState = signal<FilterPanelState>({
    search: '',
    values: {
      vendor: '',
      deviceType: '',
      region: '',
      businessService: '',
      lifecycleStatus: '',
      healthStatus: '',
      predictiveRisk: ''
    }
  });

  protected readonly filterFields = computed<FilterFieldDefinition[]>(() => {
    const list = this.devices();
    return [
      { key: 'vendor', label: 'Vendor', options: ['Cisco', 'Juniper', 'Palo Alto', 'F5', 'Arista'] },
      { key: 'deviceType', label: 'Device Type', options: ['Router', 'Switch', 'Firewall', 'Load Balancer', 'Proxy'] },
      { key: 'region', label: 'Region', options: ['EMEA', 'APAC', 'AMER'] },
      { key: 'businessService', label: 'Business Service', options: this.uniqueValues(list, 'businessService') },
      { key: 'lifecycleStatus', label: 'Lifecycle Status', options: this.uniqueValues(list, 'lifecycleStatus') },
      { key: 'healthStatus', label: 'Health Status', options: this.uniqueValues(list, 'healthStatus') },
      { key: 'predictiveRisk', label: 'Predictive Risk', options: this.uniqueValues(list, 'predictiveRisk') }
    ];
  });

  protected readonly filterMatchedDevices = computed(() => {
    const state = this.filterState();
    const searchText = state.search.trim().toLowerCase();

    return this.devices().filter((device) => {
      const searchMatches = searchText.length === 0
        || device.hostname.toLowerCase().includes(searchText)
        || device.deviceName.toLowerCase().includes(searchText);

      if (!searchMatches) {
        return false;
      }

      return Object.entries(state.values).every(([key, value]) => {
        if (!value) {
          return true;
        }

        const candidate = device[key as keyof DeviceFilters | keyof DeviceInventoryItem];
        return candidate === value;
      });
    });
  });

  protected readonly healthyCount = computed(
    () => this.filterMatchedDevices().filter((device) => this.isHealthy(device.healthStatus)).length
  );

  protected readonly criticalCount = computed(
    () => this.filterMatchedDevices().filter((device) => this.isCritical(device.healthStatus)).length
  );

  protected readonly lifecycleRiskCount = computed(
    () => this.filterMatchedDevices().filter((device) => this.hasLifecycleRisk(device.lifecycleStatus)).length
  );

  protected readonly complianceIssueCount = computed(
    () => this.filterMatchedDevices().filter((device) => this.hasComplianceIssue(device.complianceStatus)).length
  );

  protected readonly filteredDevices = computed(() => {
    const summaryFilter = this.activeSummaryFilter();
    const devices = this.filterMatchedDevices();

    if (!summaryFilter) {
      return devices;
    }

    switch (summaryFilter) {
      case 'healthy':
        return devices.filter((device) => this.isHealthy(device.healthStatus));
      case 'critical':
        return devices.filter((device) => this.isCritical(device.healthStatus));
      case 'lifecycleRisk':
        return devices.filter((device) => this.hasLifecycleRisk(device.lifecycleStatus));
      case 'complianceIssues':
        return devices.filter((device) => this.hasComplianceIssue(device.complianceStatus));
      default:
        return devices;
    }
  });

  constructor() {
    this.loadDevices();
  }

  protected resetFilters(): void {
    this.filterState.set({
      search: '',
      values: {
        vendor: '',
        deviceType: '',
        region: '',
        businessService: '',
        lifecycleStatus: '',
        healthStatus: '',
        predictiveRisk: ''
      }
    });
    this.activeSummaryFilter.set(null);
  }

  protected openDevice(device: DeviceInventoryItem): void {
    this.router.navigate(['/devices', device.id]);
  }

  protected toggleSummaryFilter(filter: SummaryFilter): void {
    this.activeSummaryFilter.update((active) => active === filter ? null : filter);
  }

  private loadDevices(): void {
    this.isLoading.set(true);
    this.deviceApi.getDevices().subscribe({
      next: (devices) => {
        this.devices.set(devices);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      }
    });
  }

  private isHealthy(healthStatus: string): boolean {
    return healthStatus.toLowerCase() === 'healthy';
  }

  private isCritical(healthStatus: string): boolean {
    const normalized = healthStatus.toLowerCase();
    return normalized === 'critical' || normalized === 'degraded';
  }

  private hasLifecycleRisk(lifecycleStatus: string): boolean {
    const normalized = lifecycleStatus.toLowerCase();
    return normalized.includes('risk') || normalized === 'end of support' || normalized === 'end of life';
  }

  private hasComplianceIssue(complianceStatus: string): boolean {
    return complianceStatus.toLowerCase() !== 'compliant';
  }

  private uniqueValues(devices: DeviceInventoryItem[], key: keyof DeviceInventoryItem): string[] {
    return [...new Set(devices.map((device) => device[key]).filter((value): value is string => Boolean(value)))].sort();
  }
}
