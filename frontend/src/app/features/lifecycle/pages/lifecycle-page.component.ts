import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DecimalPipe } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { MetricCardComponent } from '../../../shared/components/metric-card.component';
import { LifecycleApiService } from '../../../core/services/lifecycle-api.service';
import { LifecycleTableComponent } from '../components/lifecycle-table.component';
import { LifecycleChartsComponent } from '../components/lifecycle-charts.component';
import { LifecycleAiPanelComponent } from '../components/lifecycle-ai-panel.component';
import { LifecycleTimelineComponent } from '../components/lifecycle-timeline.component';
import {
  DeviceLifecycleSummary,
  LifecycleDashboardStats,
  LifecycleFilters,
} from '../../../core/models/lifecycle.model';

@Component({
  selector: 'app-lifecycle-page',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    DecimalPipe,
    PageHeaderComponent,
    MetricCardComponent,
    LifecycleTableComponent,
    LifecycleChartsComponent,
    LifecycleAiPanelComponent,
    LifecycleTimelineComponent,
  ],
  template: `
    <section class="lifecycle-page">
      <app-page-header
        title="Lifecycle Operations"
        description="Software lifecycle governance — upgrade planning, EOL exposure, and AI-powered recommendations."
      />

      <!-- Metrics row -->
      @if (dashboard(); as d) {
        <section class="metrics-row" aria-label="Lifecycle KPIs">
          <app-metric-card title="Total Devices"      [value]="(d.totalDevices | number) || '0'"        icon="dns" />
          <app-metric-card title="Unsupported"        [value]="(d.unsupportedDevices | number) || '0'"   icon="block" />
          <app-metric-card title="Disinvest"          [value]="(d.disinvestDevices | number) || '0'"     icon="trending_down" />
          <app-metric-card title="Maintain"           [value]="(d.maintainDevices | number) || '0'"      icon="check_circle" />
          <app-metric-card title="Upcoming EOL 90d"   [value]="(d.upcomingEol90Days | number) || '0'"    icon="event_busy" />
          <app-metric-card title="Avg Upgrade Risk"   [value]="((d.averageUpgradeRisk | number:'1.0-0') || '0') + '%'" icon="analytics" />
        </section>
      }

      <!-- Filters -->
      <section class="filter-bar" aria-label="Lifecycle filters">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input [(ngModel)]="filters.search" placeholder="Search hostname, vendor, OS…" class="search-input" />
        </div>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Vendor</mat-label>
          <mat-select [(ngModel)]="filters.vendor">
            <mat-option value="">All</mat-option>
            @for (v of vendors(); track v) {
              <mat-option [value]="v">{{ v }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Stage</mat-label>
          <mat-select [(ngModel)]="filters.lifecycleStage">
            <mat-option value="">All</mat-option>
            <mat-option value="Unsupported">Unsupported</mat-option>
            <mat-option value="Disinvest">Disinvest</mat-option>
            <mat-option value="Maintain">Maintain</mat-option>
            <mat-option value="Invest">Invest</mat-option>
            <mat-option value="Engineering Testing">Engineering Testing</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Region</mat-label>
          <mat-select [(ngModel)]="filters.region">
            <mat-option value="">All</mat-option>
            <mat-option value="EMEA">EMEA</mat-option>
            <mat-option value="APAC">APAC</mat-option>
            <mat-option value="AMER">AMER</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Criticality</mat-label>
          <mat-select [(ngModel)]="filters.criticality">
            <mat-option value="">All</mat-option>
            <mat-option value="Tier 1">Tier 1</mat-option>
            <mat-option value="Tier 2">Tier 2</mat-option>
            <mat-option value="Tier 3">Tier 3</mat-option>
          </mat-select>
        </mat-form-field>

        @if (hasFilters()) {
          <button class="clear-btn" (click)="clearFilters()">
            <mat-icon>close</mat-icon> Clear
          </button>
        }
      </section>

      @if (errorMsg()) {
        <div class="error-banner">{{ errorMsg() }}</div>
      }

      <!-- Main content area -->
      <div class="content-split">
        <!-- Left: table + charts -->
        <div class="left-col">
          <app-lifecycle-table
            [devices]="filtered()"
            [selectedDevice]="selectedDevice()"
            (deviceSelected)="selectDevice($event)"
          />

          @if (dashboard()) {
            <app-lifecycle-charts [stats]="dashboard()" />
          }
        </div>

        <!-- Right: AI panel + timeline -->
        <div class="right-col">
          <app-lifecycle-ai-panel
            [device]="selectedDevice()"
            (decisionComplete)="onDecision()"
          />

          @if (selectedDevice(); as sel) {
            <div class="timeline-card">
              <div class="timeline-card-header">
                <mat-icon>timeline</mat-icon>
                <span>Lifecycle Timeline — {{ sel.osVersion }}</span>
              </div>
              <app-lifecycle-timeline [summary]="sel" />
              <div class="timeline-notes">
                @if (sel.notes) {
                  <p>{{ sel.notes }}</p>
                }
              </div>
            </div>
          } @else {
            <div class="select-prompt">
              <mat-icon>touch_app</mat-icon>
              <p>Select a device from the table to view its lifecycle timeline and run an AI analysis.</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .lifecycle-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.85rem;
    }

    /* Filter bar */
    .filter-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 0.6rem;
      padding: 0.45rem 0.75rem;
      flex: 1;
      min-width: 16rem;
    }

    .search-box mat-icon { color: var(--app-text-muted); font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--app-text);
      font: inherit;
      font-size: 0.85rem;
    }

    .search-input::placeholder { color: var(--app-text-muted); }

    .filter-field {
      width: 10rem;
    }

    ::ng-deep .filter-field .mat-mdc-text-field-wrapper {
      background: var(--app-card-bg) !important;
    }

    ::ng-deep .filter-field .mdc-notched-outline__leading,
    ::ng-deep .filter-field .mdc-notched-outline__notch,
    ::ng-deep .filter-field .mdc-notched-outline__trailing {
      border-color: var(--app-border) !important;
    }

    .clear-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.45rem 0.75rem;
      border: 1px solid var(--app-border);
      border-radius: 0.6rem;
      background: transparent;
      color: var(--app-text-muted);
      font: inherit;
      font-size: 0.82rem;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }

    .clear-btn:hover { color: var(--app-text); border-color: var(--app-text-secondary); }
    .clear-btn mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .error-banner {
      padding: 0.75rem 1rem;
      background: var(--app-danger-soft);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: var(--app-radius-sm);
      color: var(--app-danger);
      font-size: 0.85rem;
    }

    /* Split layout */
    .content-split {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1rem;
      align-items: start;
    }

    .left-col, .right-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Timeline card */
    .timeline-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .timeline-card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .timeline-card-header mat-icon { color: var(--app-primary); }

    .timeline-notes p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--app-text-muted);
      line-height: 1.5;
    }

    .select-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem 1.5rem;
      background: var(--app-card-bg);
      border: 1px dashed var(--app-border);
      border-radius: var(--app-radius);
      text-align: center;
      color: var(--app-text-muted);
    }

    .select-prompt mat-icon {
      font-size: 2.2rem;
      width: 2.2rem;
      height: 2.2rem;
      opacity: 0.35;
    }

    .select-prompt p {
      margin: 0;
      font-size: 0.85rem;
      max-width: 22rem;
      line-height: 1.6;
    }

    @media (max-width: 1100px) {
      .content-split {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecyclePageComponent implements OnInit {
  protected readonly allDevices = signal<DeviceLifecycleSummary[]>([]);
  protected readonly dashboard = signal<LifecycleDashboardStats | null>(null);
  protected readonly vendors = signal<string[]>([]);
  protected readonly selectedDevice = signal<DeviceLifecycleSummary | null>(null);
  protected readonly errorMsg = signal<string | null>(null);

  protected filters: LifecycleFilters = {
    vendor: '', region: '', family: '', lifecycleStage: '',
    criticality: '', businessService: '', search: '',
  };

  protected readonly filtered = computed(() => {
    const f = this.filters;
    return this.allDevices().filter(d => {
      if (f.vendor && d.vendor !== f.vendor) return false;
      if (f.region && d.region !== f.region) return false;
      if (f.lifecycleStage && d.lifecycleStage !== f.lifecycleStage) return false;
      if (f.criticality && d.criticality !== f.criticality) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (!d.hostname.toLowerCase().includes(q) &&
            !d.vendor.toLowerCase().includes(q) &&
            !d.osVersion.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  });

  protected readonly hasFilters = computed(() =>
    !!(this.filters.vendor || this.filters.region || this.filters.lifecycleStage ||
       this.filters.criticality || this.filters.search)
  );

  constructor(private readonly api: LifecycleApiService) {}

  ngOnInit() {
    this.api.getAll().subscribe({
      next: d => this.allDevices.set(d),
      error: (e: Error) => this.errorMsg.set(e.message),
    });
    this.api.getDashboard().subscribe({
      next: d => this.dashboard.set(d),
    });
    this.api.getVendors().subscribe({
      next: v => this.vendors.set(v),
    });
  }

  protected selectDevice(device: DeviceLifecycleSummary) {
    this.selectedDevice.set(device);
  }

  protected clearFilters() {
    this.filters = { vendor: '', region: '', family: '', lifecycleStage: '', criticality: '', businessService: '', search: '' };
  }

  protected onDecision() {
    // Refresh dashboard after a new decision is stored
    this.api.getDashboard().subscribe({ next: d => this.dashboard.set(d) });
  }
}
