import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { LifecycleDashboardStats, VendorSummary } from '../../../core/models/lifecycle.model';

@Component({
  selector: 'app-lifecycle-charts',
  standalone: true,
  imports: [DecimalPipe, CommonModule],
  template: `
    <div class="charts-grid">
      <!-- Vendor distribution stacked bar -->
      <div class="chart-card wide">
        <div class="chart-header">
          <span class="chart-title">Lifecycle Distribution by Vendor</span>
          <div class="legend-row">
            @for (seg of segments; track seg.label) {
              <span class="legend-item">
                <span class="legend-dot" [style.background]="seg.color"></span>
                {{ seg.label }}
              </span>
            }
          </div>
        </div>
        <div class="stacked-chart">
          @for (vs of stats()?.vendorSummary ?? []; track vs.vendor) {
            <div class="bar-row">
              <span class="bar-label">{{ vs.vendor }}</span>
              <div class="bar-track">
                @for (seg of getVendorSegments(vs); track seg.label) {
                  @if (seg.pct > 0) {
                    <div class="bar-seg" [style.width]="seg.pct + '%'" [style.background]="seg.color" [title]="seg.label + ': ' + seg.count">
                      @if (seg.pct > 8) {
                        <span>{{ seg.count }}</span>
                      }
                    </div>
                  }
                }
              </div>
              <span class="bar-total">{{ vendorTotal(vs) }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Donut — overall distribution -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Fleet Stage Distribution</span>
        </div>
        <div class="donut-wrap">
          <svg viewBox="0 0 120 120" class="donut-svg">
            @for (arc of donutArcs(); track arc.label) {
              <circle
                class="donut-ring"
                cx="60" cy="60" r="40"
                [style.stroke]="arc.color"
                [style.stroke-dasharray]="arc.dash + ' ' + arc.gap"
                [style.stroke-dashoffset]="arc.offset"
              />
            }
            <circle cx="60" cy="60" r="30" fill="var(--app-surface)" />
            <text x="60" y="56" text-anchor="middle" class="donut-center-top">{{ stats()?.totalDevices ?? 0 }}</text>
            <text x="60" y="68" text-anchor="middle" class="donut-center-bot">DEVICES</text>
          </svg>
          <div class="donut-legend">
            @for (seg of segments; track seg.label) {
              <div class="donut-legend-item">
                <span class="legend-dot" [style.background]="seg.color"></span>
                <span class="donut-legend-label">{{ seg.label }}</span>
                <span class="donut-legend-count">{{ getStageCount(seg.key) }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- EOL countdown bars -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Critical Devices — Days to EOL</span>
        </div>
        <div class="eol-list">
          @for (d of eolDevices(); track d.deviceId) {
            <div class="eol-row">
              <div class="eol-info">
                <span class="eol-hostname">{{ d.hostname }}</span>
                <span class="eol-stage" [class]="stageClass(d.lifecycleStage)">{{ d.lifecycleStage }}</span>
              </div>
              <div class="eol-bar-wrap">
                <div class="eol-bar" [style.width]="eolBarWidth(d.daysUntilUnsupported) + '%'" [class]="eolBarClass(d.daysUntilUnsupported)"></div>
              </div>
              <span class="eol-days" [class]="eolDaysClass(d.daysUntilUnsupported)">
                {{ d.daysUntilUnsupported < 0 ? 'Past EOL' : d.daysUntilUnsupported + 'd' }}
              </span>
            </div>
          }
          @if (!eolDevices().length) {
            <p class="empty-msg">No critical devices found.</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 1rem;
    }

    .chart-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      padding: 1.25rem;
    }

    .chart-card.wide {
      grid-column: 1 / -1;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .chart-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .legend-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.72rem;
      color: var(--app-text-secondary);
    }

    .legend-dot {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Stacked bar chart */
    .stacked-chart {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .bar-row {
      display: grid;
      grid-template-columns: 7rem 1fr 2rem;
      align-items: center;
      gap: 0.75rem;
    }

    .bar-label {
      font-size: 0.78rem;
      color: var(--app-text-secondary);
      font-weight: 500;
      text-align: right;
    }

    .bar-track {
      display: flex;
      height: 1.5rem;
      border-radius: 0.4rem;
      overflow: hidden;
      background: var(--app-surface-strong);
    }

    .bar-seg {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
      transition: width 0.4s ease;
    }

    .bar-total {
      font-size: 0.72rem;
      color: var(--app-text-muted);
      text-align: right;
    }

    /* Donut */
    .donut-wrap {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .donut-svg {
      width: 7rem;
      height: 7rem;
      flex-shrink: 0;
      transform: rotate(-90deg);
    }

    .donut-ring {
      fill: none;
      stroke-width: 16;
      transition: stroke-dasharray 0.4s ease;
    }

    .donut-center-top {
      fill: var(--app-text);
      font-size: 18px;
      font-weight: 800;
      transform: rotate(90deg);
      transform-origin: 60px 60px;
    }

    .donut-center-bot {
      fill: var(--app-text-muted);
      font-size: 7px;
      font-weight: 600;
      letter-spacing: 0.08em;
      transform: rotate(90deg);
      transform-origin: 60px 60px;
    }

    .donut-legend {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
    }

    .donut-legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .donut-legend-label {
      font-size: 0.74rem;
      color: var(--app-text-secondary);
      flex: 1;
    }

    .donut-legend-count {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--app-text);
    }

    /* EOL list */
    .eol-list {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .eol-row {
      display: grid;
      grid-template-columns: 1fr 4rem 3.5rem;
      align-items: center;
      gap: 0.5rem;
    }

    .eol-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      min-width: 0;
    }

    .eol-hostname {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--app-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .eol-stage {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stage-unsupported { color: var(--app-danger); }
    .stage-disinvest   { color: var(--app-warning); }
    .stage-maintain    { color: var(--app-success); }
    .stage-invest      { color: var(--app-accent); }

    .eol-bar-wrap {
      height: 0.35rem;
      background: var(--app-surface-strong);
      border-radius: 99px;
      overflow: hidden;
    }

    .eol-bar {
      height: 100%;
      border-radius: 99px;
      transition: width 0.4s ease;
    }

    .eol-bar.red    { background: var(--app-danger); }
    .eol-bar.orange { background: var(--app-warning); }
    .eol-bar.green  { background: var(--app-success); }

    .eol-days {
      font-size: 0.7rem;
      font-weight: 700;
      text-align: right;
    }

    .eol-days.red    { color: var(--app-danger); }
    .eol-days.orange { color: var(--app-warning); }
    .eol-days.green  { color: var(--app-success); }

    .empty-msg {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
      .chart-card.wide { grid-column: 1; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecycleChartsComponent {
  readonly stats = input<LifecycleDashboardStats | null>(null);

  readonly segments = [
    { key: 'unsupportedDevices',     label: 'Unsupported',         color: '#ef4444' },
    { key: 'disinvestDevices',       label: 'Disinvest',           color: '#f97316' },
    { key: 'maintainDevices',        label: 'Maintain',            color: '#22c55e' },
    { key: 'investDevices',          label: 'Invest',              color: '#06b6d4' },
    { key: 'engineeringTestingDevices', label: 'Eng. Testing',     color: '#6366f1' },
  ] as const;

  eolDevices = computed(() =>
    (this.stats()?.criticalDevices ?? []).slice(0, 8)
  );

  getVendorSegments(vs: VendorSummary) {
    const total = this.vendorTotal(vs) || 1;
    return [
      { label: 'Unsupported',   count: vs.unsupported,       color: '#ef4444', pct: (vs.unsupported / total) * 100 },
      { label: 'Disinvest',     count: vs.disinvest,         color: '#f97316', pct: (vs.disinvest / total) * 100 },
      { label: 'Maintain',      count: vs.maintain,          color: '#22c55e', pct: (vs.maintain / total) * 100 },
      { label: 'Invest',        count: vs.invest,            color: '#06b6d4', pct: (vs.invest / total) * 100 },
      { label: 'Eng. Testing',  count: vs.engineeringTesting,color: '#6366f1', pct: (vs.engineeringTesting / total) * 100 },
    ];
  }

  vendorTotal(vs: VendorSummary) {
    return vs.unsupported + vs.disinvest + vs.maintain + vs.invest + vs.engineeringTesting;
  }

  getStageCount(key: string): number {
    const s = this.stats();
    if (!s) return 0;
    return ((s as unknown as Record<string, unknown>)[key] as number) ?? 0;
  }

  donutArcs = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const total = s.totalDevices || 1;
    const circumference = 2 * Math.PI * 40;
    const segs = this.segments.map(seg => ({
      label: seg.label,
      color: seg.color,
      count: this.getStageCount(seg.key),
    }));

    let offset = 0;
    return segs.map(seg => {
      const pct = seg.count / total;
      const dash = pct * circumference;
      const gap = circumference - dash;
      const arc = { label: seg.label, color: seg.color, dash, gap, offset: -offset };
      offset += dash;
      return arc;
    });
  });

  stageClass(stage: string): string {
    return 'stage-' + stage.toLowerCase().replace(' ', '-').replace(' ', '-');
  }

  eolBarWidth(days: number): number {
    if (days <= 0) return 100;
    if (days >= 730) return 5;
    return Math.max(5, 100 - (days / 730) * 100);
  }

  eolBarClass(days: number): string {
    if (days <= 0 || days <= 90) return 'red';
    if (days <= 365) return 'orange';
    return 'green';
  }

  eolDaysClass(days: number): string {
    if (days <= 0 || days <= 90) return 'red';
    if (days <= 365) return 'orange';
    return 'green';
  }
}
