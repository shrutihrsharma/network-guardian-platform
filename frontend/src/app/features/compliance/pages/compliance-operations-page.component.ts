import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ComplianceApiService } from '../../../core/services/compliance-api.service';
import { DeviceApiService } from '../../../core/services/device-api.service';
import {
  ComplianceFilterState,
  ComplianceKri,
  ComplianceKriTableRow,
  DeviceComplianceResponse,
} from '../../../core/models/compliance.model';
import { DeviceInventoryItem } from '../../../core/models/device.model';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { FilterFieldDefinition, FilterPanelComponent, FilterPanelState } from '../../../shared/components/filter-panel.component';
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
    FilterPanelComponent,
    ComplianceKriTableComponent,
    ComplianceAiPanelComponent,
  ],
  template: `
    <section class="compliance-page">
      <app-page-header
        title="Compliance Operations"
        description="Operational view of KRIs, risk posture, and AI-guided remediation priorities."
      />

      @if (errorMessage()) {
        <div class="error-banner">{{ errorMessage() }}</div>
      }

      <section class="overview-strip">
        <article>
          <span>Devices In Scope</span>
          <strong>{{ overview().devices }}</strong>
        </article>
        <article>
          <span>Overall Compliance</span>
          <strong>{{ overview().compliance }}%</strong>
        </article>
        <article>
          <span>Failing KRIs</span>
          <strong>{{ overview().failingKris }}</strong>
        </article>
        <article>
          <span>High/Critical Risk Devices</span>
          <strong>{{ overview().atRiskDevices }}</strong>
        </article>
      </section>

      <section class="toolbar">
        <button mat-flat-button class="primary" (click)="recalculate()" [disabled]="busy()">
          <mat-icon>refresh</mat-icon>
          Refresh Compliance
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

      <section class="main-layout">
        <div class="table-area">
          <div class="section-label">KRI Status</div>
          <app-compliance-kri-table [rows]="kriRows()" [displayedColumns]="operationsColumns" />
        </div>

        <div class="panel-area">
          <div class="section-label">AI Recommendation</div>
          <app-compliance-ai-panel (decisionComplete)="refreshHistory()" />
        </div>
      </section>
    </section>
  `,
  styles: `
    .compliance-page {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .overview-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 0.55rem;
    }

    .overview-strip article {
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      padding: 0.55rem 0.65rem;
      background: var(--app-card-bg);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .overview-strip span {
      font-size: 0.68rem;
      color: var(--app-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 700;
    }

    .overview-strip strong {
      font-size: 1rem;
      color: var(--app-text);
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
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

    .main-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      gap: 0.75rem;
      align-items: start;
    }

    .table-area,
    .panel-area {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 0;
    }

    .section-label {
      font-size: 0.7rem;
      color: var(--app-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      padding: 0 0.1rem;
    }

    @media (max-width: 1100px) {
      .main-layout {
        grid-template-columns: 1fr;
      }
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

  private readonly allKris = signal<ComplianceKri[]>([]);
  private readonly allDevices = signal<DeviceInventoryItem[]>([]);
  private readonly complianceByDevice = signal<ComplianceDeviceView[]>([]);

  protected readonly operationsColumns = ['name', 'severity', 'currentValue', 'status', 'approved'];

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

  protected readonly overview = computed(() => {
    const devices = this.filteredDevices();
    const avg = avgCompliance(devices).toFixed(1);
    const failedKriCount = this.kriRows().filter((k) => k.status === 'Failing').length;
    const atRisk = devices.filter((d) => d.riskLevel === 'High' || d.riskLevel === 'Critical').length;

    return {
      devices: devices.length,
      compliance: avg,
      failingKris: failedKriCount,
      atRiskDevices: atRisk,
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
            kris: this.complianceApi.getKris(),
            complianceRows: forkJoin(complianceCalls).pipe(
              map((rows) => rows.filter((row): row is ComplianceDeviceView => row !== null))
            ),
          });
        })
      )
      .subscribe({
        next: ({ kris, complianceRows }) => {
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
