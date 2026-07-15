import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SectionCardComponent } from '../../../shared/components/section-card.component';
import { DeviceContextStore } from '../services/device-context.store';
import { ComplianceApiService } from '../../../core/services/compliance-api.service';
import { DecisionResponse } from '../../../core/models/decision-response.model';
import { ComplianceAiPanelComponent } from '../../compliance/components/compliance-ai-panel.component';
import { DecisionAuditRow, DeviceComplianceResponse } from '../../../core/models/compliance.model';

@Component({
  selector: 'app-device-compliance-tab',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatIconModule, SectionCardComponent, ComplianceAiPanelComponent],
  template: `
    <section class="device-compliance-tab">
      @if (errorMessage()) {
        <div class="error-banner">{{ errorMessage() }}</div>
      }

      @if (compliance(); as c) {
        <section class="metrics-grid">
          <app-section-card title="Overall Compliance" description="Current compliance score for this device.">
            <div class="metric-value">{{ c.overallCompliance | number:'1.0-1' }}%</div>
          </app-section-card>

          <app-section-card title="Passed KRIs" description="Controls currently passing for this device.">
            <div class="metric-value success">{{ c.passedKRIs.length }}</div>
          </app-section-card>

          <app-section-card title="Failed KRIs" description="Controls requiring remediation.">
            <div class="metric-value danger">{{ c.failedKRIs.length }}</div>
          </app-section-card>

          <app-section-card title="Risk Level" description="Current compliance risk signal.">
            <span class="risk-chip" [class]="riskClass(c.riskLevel)">{{ c.riskLevel }}</span>
          </app-section-card>
        </section>

        <section class="detail-grid">
          <app-section-card title="Lifecycle Compliance" description="Lifecycle governance impact on compliance.">
            <div class="detail-row">
              <span>Lifecycle Stage</span>
              <strong>{{ c.lifecycleStage }}</strong>
            </div>
            <div class="detail-row">
              <span>Violation</span>
              <strong>{{ lifecycleViolation(c.lifecycleStage) ? 'Yes' : 'No' }}</strong>
            </div>
            <div class="detail-row">
              <span>Last Calculated</span>
              <strong>{{ c.lastCalculated | date:'dd MMM yyyy HH:mm' }}</strong>
            </div>
          </app-section-card>

          <app-section-card title="Incident Compliance" description="Incident behavior influencing compliance risk.">
            <div class="detail-row">
              <span>Incident Count</span>
              <strong>{{ c.incidentCount }}</strong>
            </div>
            <div class="detail-row">
              <span>Violation</span>
              <strong>{{ c.incidentCount >= 2 ? 'Yes' : 'No' }}</strong>
            </div>
          </app-section-card>

          <app-section-card title="Passed KRIs" description="Controls currently satisfied.">
            @if (c.passedKRIs.length) {
              <ul class="kri-list">
                @for (item of c.passedKRIs; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            } @else {
              <p class="empty-text">No passed KRIs recorded.</p>
            }
          </app-section-card>

          <app-section-card title="Failed KRIs" description="Controls requiring action.">
            @if (c.failedKRIs.length) {
              <ul class="kri-list danger-list">
                @for (item of c.failedKRIs; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            } @else {
              <p class="empty-text">No failed KRIs recorded.</p>
            }
          </app-section-card>
        </section>

        <app-compliance-ai-panel
          [deviceId]="c.deviceId"
          (decisionComplete)="onAiDecision($event)"
        />

        <app-section-card title="AI Recommendation" description="Latest compliance AI recommendation for this device.">
          @if (latestDecision(); as latest) {
            <div class="detail-row">
              <span>Recommendation</span>
              <strong>{{ latest.decisionResponse.recommendation || '—' }}</strong>
            </div>
            <div class="detail-row">
              <span>Risk</span>
              <strong>{{ latest.decisionResponse.risk || '—' }}</strong>
            </div>
            <div class="detail-row">
              <span>Confidence</span>
              <strong>{{ latest.decisionResponse.confidence | number:'1.0-0' }}%</strong>
            </div>
          } @else {
            <p class="empty-text">No compliance AI recommendation available yet.</p>
          }
        </app-section-card>

        <app-section-card title="Decision History" description="Compliance decision executions for this device.">
          @if (deviceDecisionHistory().length) {
            <div class="history-list">
              @for (item of deviceDecisionHistory(); track item.decisionId) {
                <article class="history-item">
                  <div class="history-top">
                    <strong>{{ item.timestamp | date:'dd MMM yyyy HH:mm' }}</strong>
                    <span>{{ item.provider }} · {{ item.model }}</span>
                  </div>
                  <div class="history-rec">{{ item.decisionResponse.recommendation || 'No recommendation available' }}</div>
                  <div class="history-meta">
                    <span>ID {{ item.decisionId }}</span>
                    <span>Confidence {{ item.decisionResponse.confidence | number:'1.0-0' }}%</span>
                  </div>
                </article>
              }
            </div>
          } @else {
            <p class="empty-text">No compliance decision history available for this device.</p>
          }
        </app-section-card>
      } @else {
        <section class="empty-state">
          <mat-icon>hourglass_top</mat-icon>
          <p>Loading compliance details for the selected device.</p>
        </section>
      }
    </section>
  `,
  styles: `
    .device-compliance-tab {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .error-banner {
      padding: 0.75rem 0.9rem;
      background: var(--app-danger-soft);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--app-radius-sm);
      color: var(--app-danger);
      font-size: 0.82rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.8rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 0.8rem;
    }

    .metric-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .metric-value.success { color: var(--app-success); }
    .metric-value.danger { color: var(--app-danger); }

    .risk-chip {
      display: inline-flex;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 700;
      border: 1px solid transparent;
    }

    .risk-critical { background: var(--app-danger-soft); color: var(--app-danger); border-color: rgba(239,68,68,0.3); }
    .risk-high { background: var(--app-warning-soft); color: var(--app-warning); border-color: rgba(249,115,22,0.3); }
    .risk-medium { background: rgba(234,179,8,0.12); color: #eab308; border-color: rgba(234,179,8,0.3); }
    .risk-low { background: var(--app-success-soft); color: var(--app-success); border-color: rgba(34,197,94,0.3); }

    .detail-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.8rem;
      border-bottom: 1px dashed var(--app-border);
      padding: 0.38rem 0;
      font-size: 0.8rem;
      color: var(--app-text-secondary);
    }

    .detail-row strong {
      color: var(--app-text);
      text-align: right;
    }

    .kri-list {
      margin: 0;
      padding-left: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .kri-list li {
      font-size: 0.78rem;
      color: var(--app-text-secondary);
      line-height: 1.4;
    }

    .danger-list li { color: var(--app-danger); }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .history-item {
      border: 1px solid var(--app-border);
      background: var(--app-surface-strong);
      border-radius: 0.6rem;
      padding: 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .history-top {
      display: flex;
      justify-content: space-between;
      gap: 0.6rem;
      font-size: 0.72rem;
      color: var(--app-text-muted);
      flex-wrap: wrap;
    }

    .history-top strong {
      color: var(--app-text);
      font-size: 0.74rem;
    }

    .history-rec {
      font-size: 0.8rem;
      color: var(--app-text-secondary);
      line-height: 1.4;
    }

    .history-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.68rem;
      color: var(--app-text-muted);
    }

    .empty-text {
      margin: 0;
      font-size: 0.8rem;
      color: var(--app-text-muted);
    }

    .empty-state {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1rem;
      border: 1px dashed var(--app-border);
      border-radius: var(--app-radius-sm);
      color: var(--app-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceComplianceTabComponent {
  private readonly contextStore = inject(DeviceContextStore);
  private readonly complianceApi = inject(ComplianceApiService);

  protected readonly compliance = signal<DeviceComplianceResponse | null>(null);
  protected readonly history = signal<DecisionAuditRow[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly deviceDecisionHistory = computed(() => this.history());
  protected readonly latestDecision = computed(() => this.history().at(0) ?? null);

  constructor() {
    effect(() => {
      const device = this.contextStore.device();
      if (!device?.id) {
        return;
      }

      this.loadDeviceCompliance(device.id);
      this.loadDecisionHistory(device.id);
    });
  }

  protected onAiDecision(_response: DecisionResponse) {
    const device = this.compliance();
    if (!device) {
      return;
    }
    this.loadDecisionHistory(device.deviceId);
    this.loadDeviceCompliance(device.deviceId);
  }

  protected lifecycleViolation(stage: string): boolean {
    return stage === 'Disinvest' || stage === 'Unsupported';
  }

  protected riskClass(risk: string): string {
    return 'risk-' + risk.toLowerCase();
  }

  private loadDeviceCompliance(deviceId: string) {
    this.errorMessage.set(null);
    this.complianceApi.getDeviceCompliance(deviceId).subscribe({
      next: (data) => this.compliance.set(data),
      error: (err: Error) => this.errorMessage.set(err.message),
    });
  }

  private loadDecisionHistory(deviceId: string) {
    this.complianceApi.getDecisionHistory().subscribe({
      next: (rows) => {
        const deviceRows = rows
          .filter((row) => (row.module ?? row.engine).toLowerCase() === 'compliance')
          .filter((row) => row.incidentId === deviceId)
          .sort((left, right) => right.timestamp.localeCompare(left.timestamp));

        this.history.set(deviceRows);
      },
      error: (err: Error) => this.errorMessage.set(err.message),
    });
  }
}
