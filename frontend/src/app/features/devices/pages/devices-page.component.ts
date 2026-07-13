import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceApiService } from '../../../core/services/device-api.service';
import { DeviceFilters, DeviceInventoryItem } from '../../../core/models/device.model';
import { FilterFieldDefinition, FilterPanelComponent, FilterPanelState } from '../../../shared/components/filter-panel.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { SummaryCardsComponent, SummaryMetric } from '../../../shared/components/summary-cards.component';
import { DeviceTableComponent } from '../components/device-table.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-devices-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    SummaryCardsComponent,
    FilterPanelComponent,
    DeviceTableComponent,
    EmptyStateComponent
  ],
  template: `
    <section class="devices-page">
      <app-page-header
        title="Devices"
        description="Enterprise inventory operations for network infrastructure, lifecycle posture, compliance, and predictive risk."
      />

      @if (errorMessage()) {
        <app-empty-state title="Inventory unavailable" [description]="errorMessage()!" icon="error_outline" />
      } @else {
        <app-summary-cards [metrics]="summaryMetrics()" />

        <app-filter-panel
          [fields]="filterFields()"
          [state]="filterState()"
          (stateChange)="filterState.set($event)"
          (resetClicked)="resetFilters()"
        />

        <app-device-table
          [devices]="filteredDevices()"
          (openDetails)="openDevice($event)"
          (selectionChanged)="selectedRows.set($event)"
        />
      }
    </section>
  `,
  styles: `
    .devices-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicesPageComponent {
  private readonly deviceApi = inject(DeviceApiService);
  private readonly router = inject(Router);

  protected readonly devices = signal<DeviceInventoryItem[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedRows = signal<DeviceInventoryItem[]>([]);

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

  protected readonly filteredDevices = computed(() => {
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

  protected readonly summaryMetrics = computed<SummaryMetric[]>(() => {
    const devices = this.filteredDevices();
    return [
      { title: 'Total Devices', value: String(devices.length), icon: 'dns' },
      { title: 'Critical Health', value: String(devices.filter((item) => item.healthStatus === 'Degraded').length), icon: 'monitor_heart' },
      { title: 'High Predictive Risk', value: String(devices.filter((item) => item.predictiveRisk === 'High').length), icon: 'warning' },
      { title: 'Non-Compliant', value: String(devices.filter((item) => item.complianceStatus === 'Non-Compliant').length), icon: 'gpp_bad' },
      { title: 'Tier 1 Criticality', value: String(devices.filter((item) => item.criticality === 'Tier 1').length), icon: 'priority_high' },
      { title: 'Selected Rows', value: String(this.selectedRows().length), icon: 'checklist' }
    ];
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
  }

  protected openDevice(device: DeviceInventoryItem): void {
    this.router.navigate(['/devices', device.id]);
  }

  private loadDevices(): void {
    this.deviceApi.getDevices().subscribe({
      next: (devices) => {
        this.devices.set(devices);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
      }
    });
  }

  private uniqueValues(devices: DeviceInventoryItem[], key: keyof DeviceInventoryItem): string[] {
    return [...new Set(devices.map((device) => device[key]).filter((value): value is string => Boolean(value)))].sort();
  }
}
