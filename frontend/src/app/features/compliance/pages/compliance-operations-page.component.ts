import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ComplianceApiService } from '../../../core/services/compliance-api.service';
import { DeviceApiService } from '../../../core/services/device-api.service';
import {
  ComplianceBreakdownItem,
  ComplianceDashboardResponse,
  ComplianceFilterState,
  ComplianceHeatmapCell,
  ComplianceKri,
  ComplianceKriFailureItem,
  ComplianceKriTableRow,
  ComplianceSummaryResponse,
  DeviceComplianceResponse,
  IncidentCompliancePoint,
  LifecycleCompliancePoint,
} from '../../../core/models/compliance.model';
import { DeviceInventoryItem } from '../../../core/models/device.model';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { SummaryCardsComponent, SummaryMetric } from '../../../shared/components/summary-cards.component';
import { FilterFieldDefinition, FilterPanelComponent, FilterPanelState } from '../../../shared/components/filter-panel.component';
import { ComplianceChartsComponent } from '../components/compliance-charts.component';
import { ComplianceKriTableComponent } from '../components/compliance-kri-table.component';
import { ComplianceAiPanelComponent } from '../components/compliance-ai-panel.component';

type ComplianceDeviceView = DeviceComplianceResponse & {
  businessService: string;
};

@Component({
  selector: 'app-compliance-operations-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    SummaryCardsComponent,
    FilterPanelComponent,
    ComplianceChartsComponent,
    ComplianceKriTableComponent,
    ComplianceAiPanelComponent,
  ],
  template: `
    <section class="compliance-page">
      <app-page-header
        title="Compliance Operations"
        description="Enterprise compliance intelligence across KRIs, lifecycle posture, incident behavior, and AI-guided remediation."
      />

      @if (errorMessage()) {
        <div class="error-banner">{{ errorMessage() }}</div>
      }

      <app-summary-cards [metrics]="summaryMetrics()" />

      <section class="toolbar">
        <button mat-flat-button class="primary" (click)="recalculate()" [disabled]="busy()">
          <mat-icon>refresh</mat-icon>
          Recalculate Compliance
        </button>

        <button mat-stroked-button (click)="generateKriSuggestions()" [disabled]="busy()">
          <mat-icon>auto_awesome</mat-icon>
          Generate AI KRIs
        </button>

        <button mat-stroked-button [routerLink]="['/compliance/kri-review']">
          <mat-icon>rule_folder</mat-icon>
          Review AI KRIs
        </button>
      </section>

      @if (statusMessage()) {
        <div class="status-banner">{{ statusMessage() }}</div>
      }

      <app-filter-panel
        [fields]="filterFields()"
        [state]="filterPanelState()"
        (stateChange)="onFilterStateChanged($event)"
        (resetClicked)="resetFilters()"
      />

      <app-compliance-charts
        [dashboard]="filteredDashboard()"
        [devices]="filteredDevices()"
        [filters]="filters()"
      />

      <app-compliance-kri-table [rows]="kriRows()" />

      <app-compliance-ai-panel (decisionComplete)="refreshHistory()" />
    </section>
  `,
  styles: `
    .compliance-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
    }

    .primary {
      background: var(--app-primary) !important;
      color: #0b1220 !important;
      font-weight: 700;
    }

    .error-banner,
    .status-banner {
      padding: 0.75rem 0.9rem;
      border-radius: var(--app-radius-sm);
      font-size: 0.82rem;
    }

    .error-banner {
      background: var(--app-danger-soft);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--app-danger);
    }

    .status-banner {
      background: var(--app-accent-soft);
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: var(--app-accent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceOperationsPageComponent {
  private readonly complianceApi = inject(ComplianceApiService);
  private readonly deviceApi = inject(DeviceApiService);
  private readonly router = inject(Router);

  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly statusMessage = signal<string | null>(null);

  private readonly summary = signal<ComplianceSummaryResponse | null>(null);
  private readonly dashboard = signal<ComplianceDashboardResponse | null>(null);
  private readonly allKris = signal<ComplianceKri[]>([]);
  private readonly allDevices = signal<DeviceInventoryItem[]>([]);
  private readonly complianceByDevice = signal<ComplianceDeviceView[]>([]);

  protected readonly filters = signal<ComplianceFilterState>({
    search: '',
    vendor: '',
    region: '',
    deviceType: '',
    businessService: '',
    lifecycleStage: '',
    riskLevel: '',
  });

  protected readonly filterPanelState = computed<FilterPanelState>(() => {
    const f = this.filters();
    return {
      search: f.search,
      values: {
        vendor: f.vendor,
        region: f.region,
        deviceType: f.deviceType,
        businessService: f.businessService,
        lifecycleStage: f.lifecycleStage,
        riskLevel: f.riskLevel,
      },
    };
  });

  protected readonly filterFields = computed<FilterFieldDefinition[]>(() => {
    const list = this.complianceByDevice();
    return [
      { key: 'vendor', label: 'Vendor', options: unique(list.map((d) => d.vendor)) },
      { key: 'region', label: 'Region', options: unique(list.map((d) => d.region)) },
      { key: 'deviceType', label: 'Device Type', options: unique(list.map((d) => d.deviceType)) },
      { key: 'businessService', label: 'Business Service', options: unique(list.map((d) => d.businessService)) },
      { key: 'lifecycleStage', label: 'Lifecycle Stage', options: unique(list.map((d) => d.lifecycleStage)) },
      { key: 'riskLevel', label: 'Risk Level', options: unique(list.map((d) => d.riskLevel)) },
    ];
  });

  protected readonly filteredDevices = computed(() => {
    const filters = this.filters();
    const q = filters.search.trim().toLowerCase();

    return this.complianceByDevice().filter((item) => {
      if (filters.vendor && item.vendor !== filters.vendor) return false;
      if (filters.region && item.region !== filters.region) return false;
      if (filters.deviceType && item.deviceType !== filters.deviceType) return false;
      if (filters.businessService && item.businessService !== filters.businessService) return false;
      if (filters.lifecycleStage && item.lifecycleStage !== filters.lifecycleStage) return false;
      if (filters.riskLevel && item.riskLevel !== filters.riskLevel) return false;

      if (!q) return true;

      return (
        item.hostname.toLowerCase().includes(q) ||
        item.deviceId.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.businessService.toLowerCase().includes(q)
      );
    });
  });

  protected readonly kriRows = computed<ComplianceKriTableRow[]>(() => {
    const devices = this.filteredDevices();
    const total = Math.max(1, devices.length);

    return this.allKris().map((kri) => {
      const failedDevices = devices.filter((d) => d.failedKRIs?.includes(kri.name)).length;

      return {
        id: kri.id,
        name: kri.name,
        category: kri.category,
        severity: kri.severity,
        threshold: kri.threshold,
        currentValue: failedDevices,
        status: (failedDevices > 0 ? 'Failing' : 'Passing') as 'Failing' | 'Passing',
        aiGenerated: kri.aiGenerated,
        approved: kri.approved,
        enabled: kri.enabled,
        description: kri.description,
      };
    }).sort((a, b) => {
      if (a.status === b.status) return a.name.localeCompare(b.name);
      return a.status === 'Failing' ? -1 : 1;
    });
  });

  protected readonly summaryMetrics = computed<SummaryMetric[]>(() => {
    const devices = this.filteredDevices();
    const avg = avgCompliance(devices);
    const failedKriCount = this.kriRows().filter((k) => k.status === 'Failing').length;
    const criticalKriCount = this.kriRows().filter((k) => k.status === 'Failing' && k.severity.toLowerCase() === 'critical').length;
    const atRisk = devices.filter((d) => d.riskLevel === 'High' || d.riskLevel === 'Critical').length;
    const lifecycleViolations = devices.filter((d) => d.lifecycleStage === 'Disinvest' || d.lifecycleStage === 'Unsupported').length;
    const incidentViolations = devices.filter((d) => d.incidentCount >= 2).length;
    const upcomingRisks = devices.filter((d) => d.riskLevel !== 'Low' && d.overallCompliance < 85).length;

    return [
      { title: 'Overall Compliance', value: `${avg.toFixed(1)}%`, icon: 'verified' },
      { title: 'Critical KRIs', value: String(criticalKriCount), icon: 'gpp_bad' },
      { title: 'Failed KRIs', value: String(failedKriCount), icon: 'rule' },
      { title: 'Devices at Risk', value: String(atRisk), icon: 'warning' },
      { title: 'Lifecycle Violations', value: String(lifecycleViolations), icon: 'event_busy' },
      { title: 'Incident Violations', value: String(incidentViolations), icon: 'report_problem' },
      { title: 'Upcoming Compliance Risks', value: String(upcomingRisks), icon: 'notifications_active' },
    ];
  });

  protected readonly filteredDashboard = computed<ComplianceDashboardResponse | null>(() => {
    const devices = this.filteredDevices();
    if (!devices.length) {
      return this.dashboard();
    }

    const topFailed = topFailedFromDevices(devices);

    return {
      summaryCards: {
        totalDevices: devices.length,
        compliantDevices: devices.filter((d) => d.overallCompliance >= 85).length,
        atRiskDevices: devices.filter((d) => d.riskLevel === 'High' || d.riskLevel === 'Critical').length,
        criticalRiskDevices: devices.filter((d) => d.riskLevel === 'Critical').length,
        averageCompliance: avgCompliance(devices),
        failedKriObservations: devices.reduce((sum, d) => sum + (d.failedKRIs?.length ?? 0), 0),
      },
      vendorCompliance: breakdown(devices, (d) => d.vendor),
      regionCompliance: breakdown(devices, (d) => d.region),
      deviceTypeCompliance: breakdown(devices, (d) => d.deviceType),
      topFailedKRIs: topFailed,
      complianceHeatmap: heatmap(devices),
      lifecycleVsCompliance: lifecycleVs(devices),
      incidentVsCompliance: incidentVs(devices),
      generatedAt: new Date().toISOString(),
    };
  });

  constructor() {
    this.loadPage();
  }

  protected onFilterStateChanged(next: FilterPanelState) {
    this.filters.set({
      search: next.search,
      vendor: next.values['vendor'] ?? '',
      region: next.values['region'] ?? '',
      deviceType: next.values['deviceType'] ?? '',
      businessService: next.values['businessService'] ?? '',
      lifecycleStage: next.values['lifecycleStage'] ?? '',
      riskLevel: next.values['riskLevel'] ?? '',
    });
  }

  protected resetFilters() {
    this.filters.set({
      search: '',
      vendor: '',
      region: '',
      deviceType: '',
      businessService: '',
      lifecycleStage: '',
      riskLevel: '',
    });
  }

  protected recalculate() {
    this.busy.set(true);
    this.statusMessage.set(null);
    this.complianceApi.recalculate().subscribe({
      next: (res) => {
        this.statusMessage.set(`Compliance recalculated for ${res.devicesProcessed} devices.`);
        this.loadPage();
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  protected generateKriSuggestions() {
    this.busy.set(true);
    this.statusMessage.set(null);
    this.complianceApi.generateKri({}).subscribe({
      next: (result) => {
        this.statusMessage.set(`Generated ${result.suggestedKris?.length ?? 0} AI KRI suggestions.`);
        this.loadKris();
        this.busy.set(false);
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  protected refreshHistory() {
    this.statusMessage.set('AI recommendation stored in decision history.');
  }

  private loadPage() {
    this.busy.set(true);
    this.errorMessage.set(null);

    this.deviceApi
      .getDevices()
      .pipe(
        switchMap((devices) => {
          this.allDevices.set(devices);

          const complianceCalls = devices.map((device) =>
            this.complianceApi.getDeviceCompliance(device.id).pipe(
              map((compliance): ComplianceDeviceView => ({
                ...compliance,
                businessService: device.businessService,
              })),
              catchError(() => of(null))
            )
          );

          return forkJoin({
            summary: this.complianceApi.getSummary(),
            dashboard: this.complianceApi.getDashboard(),
            kris: this.complianceApi.getKris(),
            complianceRows: forkJoin(complianceCalls).pipe(
              map((rows) => rows.filter((row): row is ComplianceDeviceView => row !== null))
            ),
          });
        })
      )
      .subscribe({
        next: ({ summary, dashboard, kris, complianceRows }) => {
          this.summary.set(summary);
          this.dashboard.set(dashboard);
          this.allKris.set(kris);
          this.complianceByDevice.set(complianceRows);
          this.busy.set(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.busy.set(false);
        },
      });
  }

  private loadKris() {
    this.complianceApi.getKris().subscribe({
      next: (kris) => this.allKris.set(kris),
      error: (err: Error) => this.errorMessage.set(err.message),
    });
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((v) => !!v))].sort();
}

function avgCompliance(devices: DeviceComplianceResponse[]): number {
  if (!devices.length) {
    return 0;
  }
  return devices.reduce((sum, item) => sum + item.overallCompliance, 0) / devices.length;
}

function breakdown(
  devices: DeviceComplianceResponse[],
  keySelector: (device: DeviceComplianceResponse) => string
): ComplianceBreakdownItem[] {
  const mapByDimension = new Map<string, DeviceComplianceResponse[]>();

  for (const device of devices) {
    const key = keySelector(device) || 'Unknown';
    const list = mapByDimension.get(key) ?? [];
    list.push(device);
    mapByDimension.set(key, list);
  }

  return [...mapByDimension.entries()]
    .map(([name, list]) => ({
      name,
      deviceCount: list.length,
      highRiskDevices: list.filter((d) => d.riskLevel === 'High' || d.riskLevel === 'Critical').length,
      averageCompliance: avgCompliance(list),
    }))
    .sort((a, b) => b.averageCompliance - a.averageCompliance);
}

function topFailedFromDevices(devices: DeviceComplianceResponse[]): ComplianceKriFailureItem[] {
  const counter = new Map<string, number>();

  devices.forEach((device) => {
    (device.failedKRIs ?? []).forEach((kri) => {
      counter.set(kri, (counter.get(kri) ?? 0) + 1);
    });
  });

  return [...counter.entries()]
    .map(([kriName, failedDevices], index) => ({
      kriId: `KRI-${index + 1}`,
      kriName,
      severity: 'High',
      failedDevices,
    }))
    .sort((a, b) => b.failedDevices - a.failedDevices)
    .slice(0, 10);
}

function heatmap(devices: DeviceComplianceResponse[]): ComplianceHeatmapCell[] {
  const mapByCell = new Map<string, DeviceComplianceResponse[]>();
  devices.forEach((device) => {
    const key = `${device.region}|${device.riskLevel}`;
    const list = mapByCell.get(key) ?? [];
    list.push(device);
    mapByCell.set(key, list);
  });

  return [...mapByCell.entries()].map(([key, list]) => {
    const [region, riskLevel] = key.split('|');
    return {
      region,
      riskLevel,
      deviceCount: list.length,
      averageCompliance: avgCompliance(list),
    };
  });
}

function lifecycleVs(devices: DeviceComplianceResponse[]): LifecycleCompliancePoint[] {
  const groups = new Map<string, DeviceComplianceResponse[]>();
  devices.forEach((device) => {
    const list = groups.get(device.lifecycleStage) ?? [];
    list.push(device);
    groups.set(device.lifecycleStage, list);
  });

  return [...groups.entries()].map(([lifecycleStage, list]) => ({
    lifecycleStage,
    deviceCount: list.length,
    averageCompliance: avgCompliance(list),
  }));
}

function incidentVs(devices: DeviceComplianceResponse[]): IncidentCompliancePoint[] {
  const groups = new Map<string, DeviceComplianceResponse[]>();
  devices.forEach((device) => {
    const band = device.incidentCount <= 0 ? '0' : device.incidentCount === 1 ? '1' : '2+';
    const list = groups.get(band) ?? [];
    list.push(device);
    groups.set(band, list);
  });

  return [...groups.entries()].map(([incidentBand, list]) => ({
    incidentBand,
    deviceCount: list.length,
    averageCompliance: avgCompliance(list),
  }));
}
