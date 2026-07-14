import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SectionCardComponent } from '../../../shared/components/section-card.component';
import { LifecycleTimelineComponent } from '../../lifecycle/components/lifecycle-timeline.component';
import { LifecycleAiPanelComponent } from '../../lifecycle/components/lifecycle-ai-panel.component';
import { LifecycleApiService } from '../../../core/services/lifecycle-api.service';
import { DeviceContextStore } from '../services/device-context.store';
import { DeviceLifecycleSummary } from '../../../core/models/lifecycle.model';

@Component({
  selector: 'app-device-lifecycle-tab',
  standalone: true,
  imports: [MatIconModule, SectionCardComponent, LifecycleTimelineComponent, LifecycleAiPanelComponent],
  template: `
    <section class="tab-grid">
      @if (summary(); as s) {
        <!-- Summary card -->
        <app-section-card title="Lifecycle Summary" description="Current OS support phase and version alignment.">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="s-label">Current Version</span>
              <span class="s-value mono">{{ s.osVersion }}</span>
            </div>
            <div class="summary-item">
              <span class="s-label">Recommended Version</span>
              <span class="s-value mono rec">{{ s.recommendedVersion }}</span>
            </div>
            <div class="summary-item">
              <span class="s-label">Stage</span>
              <span class="s-value stage" [class]="'stage-' + s.lifecycleStage.toLowerCase().replace(' ','-')">{{ s.lifecycleStage }}</span>
            </div>
            <div class="summary-item">
              <span class="s-label">Days to EOL</span>
              <span class="s-value" [class]="daysClass(s.daysUntilUnsupported)">
                {{ s.daysUntilUnsupported < 0 ? 'Past EOL' : s.daysUntilUnsupported + ' days' }}
              </span>
            </div>
            <div class="summary-item">
              <span class="s-label">Vendor Family</span>
              <span class="s-value">{{ s.vendor }} {{ s.family }}</span>
            </div>
            <div class="summary-item">
              <span class="s-label">Unsupported Date</span>
              <span class="s-value">{{ s.unsupportedDate }}</span>
            </div>
          </div>
          @if (s.notes) {
            <p class="notes">{{ s.notes }}</p>
          }
        </app-section-card>

        <!-- Timeline -->
        <app-section-card title="Lifecycle Timeline" description="OS version progression through support phases.">
          <app-lifecycle-timeline [summary]="s" />
        </app-section-card>

        <!-- AI Panel -->
        <div class="ai-col">
          <app-lifecycle-ai-panel [device]="s" />
        </div>
      } @else if (loading()) {
        <app-section-card title="Loading…" description="Fetching lifecycle data for this device.">
          <div class="loading-placeholder">
            <mat-icon class="spin">autorenew</mat-icon>
            <p>Loading lifecycle information…</p>
          </div>
        </app-section-card>
      } @else if (errorMsg()) {
        <app-section-card title="Lifecycle Data Unavailable" [description]="errorMsg()!">
          <p class="no-data">No lifecycle entry is linked to this device. Please ensure the device is seeded with a lifecycle reference.</p>
        </app-section-card>
      }
    </section>
  `,
  styles: `
    .tab-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .ai-col {
      grid-column: 1 / -1;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.65rem;
      margin-bottom: 0.75rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .s-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--app-text-muted);
    }

    .s-value {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--app-text);
    }

    .s-value.mono { font-family: monospace; color: var(--app-accent); }
    .s-value.rec  { color: var(--app-success); }

    .stage-unsupported { color: var(--app-danger); }
    .stage-disinvest   { color: var(--app-warning); }
    .stage-maintain    { color: var(--app-success); }
    .stage-invest      { color: var(--app-accent); }
    .stage-engineering-testing { color: #6366f1; }

    .days-critical { color: var(--app-danger); }
    .days-warning  { color: var(--app-warning); }
    .days-ok       { color: var(--app-text-secondary); }

    .notes {
      margin: 0;
      padding: 0.65rem 0.85rem;
      background: var(--app-surface-strong);
      border-radius: var(--app-radius-sm);
      border-left: 3px solid var(--app-primary);
      font-size: 0.82rem;
      color: var(--app-text-secondary);
      line-height: 1.5;
    }

    .loading-placeholder {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--app-text-muted);
    }

    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .no-data, .loading-placeholder p {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.88rem;
      line-height: 1.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceLifecycleTabComponent implements OnInit {
  protected readonly summary = signal<DeviceLifecycleSummary | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMsg = signal<string | null>(null);

  constructor(
    private readonly api: LifecycleApiService,
    private readonly contextStore: DeviceContextStore,
  ) {}

  ngOnInit() {
    const device = this.contextStore.device();
    if (!device) {
      this.loading.set(false);
      this.errorMsg.set('No device context available.');
      return;
    }

    this.api.getForDevice(device.id).subscribe({
      next: s => { this.summary.set(s); this.loading.set(false); },
      error: (e: Error) => { this.errorMsg.set(e.message); this.loading.set(false); },
    });
  }

  protected daysClass(days: number): string {
    if (days < 0 || days <= 90) return 'days-critical';
    if (days <= 365) return 'days-warning';
    return 'days-ok';
  }
}
