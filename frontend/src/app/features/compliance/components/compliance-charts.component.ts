import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  ComplianceDashboardResponse,
  ComplianceFilterState,
  DeviceComplianceResponse,
} from '../../../core/models/compliance.model';

@Component({
  selector: 'app-compliance-charts',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="charts-grid">
      <article class="chart-card">
        <header><h3>Overall Compliance</h3></header>
        <div class="gauge-wrap">
          <svg viewBox="0 0 120 120" class="gauge">
            <circle cx="60" cy="60" r="45" class="gauge-bg" />
            <circle
              cx="60"
              cy="60"
              r="45"
              class="gauge-progress"
              [style.strokeDasharray]="gaugeDash()"
            />
          </svg>
          <div class="gauge-center">
            <strong>{{ overallCompliance() | number:'1.0-1' }}%</strong>
            <span>Fleet Avg</span>
          </div>
        </div>
      </article>

      <article class="chart-card">
        <header><h3>Vendor Compliance</h3></header>
        <div class="bar-list">
          @for (item of vendorBreakdown(); track item.name) {
            <div class="bar-row">
              <span>{{ item.name }}</span>
              <div class="track"><div class="fill" [style.width]="item.averageCompliance + '%'"></div></div>
              <strong>{{ item.averageCompliance | number:'1.0-0' }}%</strong>
            </div>
          }
        </div>
      </article>

      <article class="chart-card">
        <header><h3>Region Compliance</h3></header>
        <div class="bar-list">
          @for (item of regionBreakdown(); track item.name) {
            <div class="bar-row">
              <span>{{ item.name }}</span>
              <div class="track"><div class="fill alt" [style.width]="item.averageCompliance + '%'"></div></div>
              <strong>{{ item.averageCompliance | number:'1.0-0' }}%</strong>
            </div>
          }
        </div>
      </article>

      <article class="chart-card">
        <header><h3>Device Type Compliance</h3></header>
        <div class="bar-list">
          @for (item of typeBreakdown(); track item.name) {
            <div class="bar-row">
              <span>{{ item.name }}</span>
              <div class="track"><div class="fill cyan" [style.width]="item.averageCompliance + '%'"></div></div>
              <strong>{{ item.averageCompliance | number:'1.0-0' }}%</strong>
            </div>
          }
        </div>
      </article>

      <article class="chart-card">
        <header><h3>Top Failed KRIs</h3></header>
        <div class="bar-list">
          @for (item of topFailedKris(); track item.kriName) {
            <div class="bar-row">
              <span>{{ item.kriName }}</span>
              <div class="track"><div class="fill danger" [style.width]="failedKriWidth(item.failedDevices) + '%'"></div></div>
              <strong>{{ item.failedDevices }}</strong>
            </div>
          }
        </div>
      </article>

      <article class="chart-card">
        <header><h3>Compliance Trend</h3></header>
        <div class="trend-wrap">
          <svg viewBox="0 0 300 90" class="trend-svg" preserveAspectRatio="none">
            <polyline [attr.points]="trendPoints()" class="trend-line" />
          </svg>
          <div class="trend-labels">
            @for (label of trendLabels; track label) {
              <span>{{ label }}</span>
            }
          </div>
        </div>
      </article>

      <article class="chart-card wide">
        <header><h3>Compliance Heatmap</h3></header>
        <div class="heatmap">
          @for (cell of heatmapCells(); track cell.region + '-' + cell.riskLevel) {
            <div class="heat-cell" [style.opacity]="heatIntensity(cell.averageCompliance)">
              <span class="region">{{ cell.region }}</span>
              <span class="risk">{{ cell.riskLevel }}</span>
              <strong>{{ cell.averageCompliance | number:'1.0-0' }}%</strong>
              <small>{{ cell.deviceCount }} devices</small>
            </div>
          }
        </div>
      </article>

      <article class="chart-card">
        <header><h3>Lifecycle vs Compliance</h3></header>
        <div class="bar-list">
          @for (item of lifecycleVs(); track item.lifecycleStage) {
            <div class="bar-row">
              <span>{{ item.lifecycleStage }}</span>
              <div class="track"><div class="fill" [style.width]="item.averageCompliance + '%'"></div></div>
              <strong>{{ item.averageCompliance | number:'1.0-0' }}%</strong>
            </div>
          }
        </div>
      </article>

      <article class="chart-card">
        <header><h3>Incident vs Compliance</h3></header>
        <div class="bar-list">
          @for (item of incidentVs(); track item.incidentBand) {
            <div class="bar-row">
              <span>{{ item.incidentBand }} incident(s)</span>
              <div class="track"><div class="fill warning" [style.width]="item.averageCompliance + '%'"></div></div>
              <strong>{{ item.averageCompliance | number:'1.0-0' }}%</strong>
            </div>
          }
        </div>
      </article>
    </section>
  `,
  styles: `
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.8rem;
    }

    .chart-card {
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      background: var(--app-card-bg);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      min-width: 0;
    }

    .chart-card.wide {
      grid-column: 1 / -1;
    }

    header h3 {
      margin: 0;
      font-size: 0.84rem;
      color: var(--app-text);
    }

    .gauge-wrap {
      position: relative;
      width: 7rem;
      height: 7rem;
      margin: 0 auto;
    }

    .gauge {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .gauge-bg {
      fill: none;
      stroke: var(--app-border);
      stroke-width: 10;
    }

    .gauge-progress {
      fill: none;
      stroke: var(--app-primary);
      stroke-width: 10;
      stroke-linecap: round;
      transition: stroke-dasharray 0.4s ease;
    }

    .gauge-center {
      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      text-align: center;
    }

    .gauge-center strong {
      color: var(--app-text);
      font-size: 1rem;
    }

    .gauge-center span {
      color: var(--app-text-muted);
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bar-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .bar-row {
      display: grid;
      grid-template-columns: 8.5rem minmax(0, 1fr) 2.4rem;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
    }

    .bar-row span {
      font-size: 0.72rem;
      color: var(--app-text-secondary);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .track {
      height: 0.38rem;
      border-radius: 999px;
      background: var(--app-surface-strong);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      border-radius: 999px;
      background: var(--app-primary);
    }

    .fill.alt { background: var(--app-success); }
    .fill.cyan { background: var(--app-accent); }
    .fill.danger { background: var(--app-danger); }
    .fill.warning { background: var(--app-warning); }

    .bar-row strong {
      font-size: 0.72rem;
      color: var(--app-text);
      text-align: right;
    }

    .trend-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .trend-svg {
      width: 100%;
      height: 5.2rem;
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      background: linear-gradient(180deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.02) 100%);
    }

    .trend-line {
      fill: none;
      stroke: var(--app-primary);
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .trend-labels {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      font-size: 0.64rem;
      color: var(--app-text-muted);
      text-align: center;
    }

    .heatmap {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.45rem;
    }

    .heat-cell {
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      background: var(--app-primary-soft);
      padding: 0.55rem;
      display: flex;
      flex-direction: column;
      gap: 0.18rem;
    }

    .heat-cell .region {
      font-size: 0.64rem;
      color: var(--app-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .heat-cell .risk {
      font-size: 0.72rem;
      color: var(--app-text-secondary);
    }

    .heat-cell strong {
      color: var(--app-text);
      font-size: 0.9rem;
    }

    .heat-cell small {
      color: var(--app-text-muted);
      font-size: 0.66rem;
    }

    @media (max-width: 1080px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceChartsComponent {
  readonly dashboard = input.required<ComplianceDashboardResponse | null>();
  readonly devices = input.required<DeviceComplianceResponse[]>();
  readonly filters = input.required<ComplianceFilterState>();

  readonly trendLabels = ['-5w', '-4w', '-3w', '-2w', '-1w', 'Now'];

  protected readonly overallCompliance = computed(() => {
    const list = this.devices();
    if (!list.length) {
      return 0;
    }
    return list.reduce((sum, item) => sum + item.overallCompliance, 0) / list.length;
  });

  protected readonly vendorBreakdown = computed(() => this.dashboard()?.vendorCompliance ?? []);
  protected readonly regionBreakdown = computed(() => this.dashboard()?.regionCompliance ?? []);
  protected readonly typeBreakdown = computed(() => this.dashboard()?.deviceTypeCompliance ?? []);
  protected readonly topFailedKris = computed(() => this.dashboard()?.topFailedKRIs ?? []);
  protected readonly heatmapCells = computed(() => this.dashboard()?.complianceHeatmap ?? []);
  protected readonly lifecycleVs = computed(() => this.dashboard()?.lifecycleVsCompliance ?? []);
  protected readonly incidentVs = computed(() => this.dashboard()?.incidentVsCompliance ?? []);

  protected readonly trendPoints = computed(() => {
    const avg = this.overallCompliance();
    const spread = Math.max(3, (100 - avg) * 0.08);
    const values = [
      Math.max(0, avg - spread * 1.8),
      Math.max(0, avg - spread * 1.2),
      Math.max(0, avg - spread * 0.75),
      Math.max(0, avg - spread * 0.35),
      Math.max(0, avg - spread * 0.12),
      avg,
    ];

    return values
      .map((value, index) => {
        const x = 15 + index * 54;
        const y = 80 - value * 0.65;
        return `${x},${y}`;
      })
      .join(' ');
  });

  protected gaugeDash(): string {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(100, this.overallCompliance()));
    return `${(progress / 100) * circumference} ${circumference}`;
  }

  protected failedKriWidth(failedDevices: number): number {
    const max = Math.max(...(this.topFailedKris().map((item) => item.failedDevices).concat([1])));
    return (failedDevices / max) * 100;
  }

  protected heatIntensity(avg: number): number {
    return 0.35 + Math.max(0, Math.min(65, avg)) / 100;
  }

}
