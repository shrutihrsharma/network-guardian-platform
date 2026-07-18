import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecisionResponse } from '../../../core/models/decision-response.model';
import { DeviceLifecycleSummary } from '../../../core/models/lifecycle.model';
import { LifecycleApiService } from '../../../core/services/lifecycle-api.service';

@Component({
  selector: 'app-lifecycle-ai-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="ai-panel">
      <div class="ai-panel__header">
        <div>
          <div class="ai-panel__title">Lifecycle Analysis</div>
          <div class="ai-panel__sub">Contextual recommendation for selected device lifecycle actions.</div>
        </div>
        <button
          mat-flat-button
          class="analyze-btn"
          [disabled]="loading() || !device()"
          (click)="analyze()"
        >
          @if (loading()) {
            <mat-spinner diameter="16" />
            Analyzing...
          } @else {
            <ng-container>
              <mat-icon>play_circle</mat-icon>
            </ng-container>
            Analyze Lifecycle
          }
        </button>
      </div>

      @if (errorMsg()) {
        <div class="error-banner">{{ errorMsg() }}</div>
      }

      <section class="panel-section">
        <h4>Selected Device</h4>
        <div class="detail-row"><span>Hostname</span><strong>{{ device()?.hostname || 'No data available' }}</strong></div>
        <div class="detail-row"><span>Current OS</span><strong>{{ device()?.osVersion || 'No data available' }}</strong></div>
        <div class="detail-row"><span>Recommended OS</span><strong>{{ device()?.recommendedVersion || 'No data available' }}</strong></div>
        <div class="detail-row"><span>Vendor Lifecycle Stage</span><strong>{{ device()?.lifecycleStage || 'No data available' }}</strong></div>
        <div class="detail-row"><span>Days to EOL</span><strong>{{ daysToEolLabel() }}</strong></div>
      </section>

      @if (result(); as r) {
        <section class="panel-section">
          <h4>Decision</h4>
          <div class="detail-row"><span>Business Impact</span><strong>{{ r.businessImpact || 'No data available' }}</strong></div>
          <div class="detail-row"><span>Risk</span><strong>{{ r.risk || 'No data available' }}</strong></div>
          <div class="detail-row"><span>AI Recommendation</span><strong>{{ r.recommendation || 'No data available' }}</strong></div>
          <div class="detail-row"><span>Confidence</span><strong>{{ confidenceLabel() }}</strong></div>
          <div class="reasoning-block">{{ r.reasoning || 'No data available' }}</div>
        </section>

        <section class="panel-section">
          <h4>Supporting Knowledge</h4>
          <p class="supporting-note">
            Knowledge from enterprise runbooks and vendor documentation will appear here after RAG integration.
          </p>
        </section>

        <section class="panel-section">
          <h4>Actions</h4>
          <div class="action-row">
            <button
              mat-flat-button
              class="analyze-btn"
              [disabled]="simulationRunning()"
              (click)="simulateApplyRecommendation()"
            >
              Apply Recommendation
            </button>
            <button
              mat-stroked-button
              class="export-btn"
              disabled
            >
              Export Report
            </button>
          </div>

          @if (simulationVisible()) {
            <div class="simulation-panel">
              @for (step of simulationSteps; track step; let idx = $index) {
                <div class="simulation-step" [class.is-complete]="idx <= simulationStepIndex()">
                  <span class="step-icon">✓</span>
                  <span>{{ step }}</span>
                </div>
              }
              @if (simulationComplete()) {
                <div class="simulation-done">Simulation completed successfully.</div>
              }
            </div>
          }
        </section>

        <div class="audit-row">
          <span class="audit-chip">Decision ID: {{ r.decisionId }}</span>
          <span class="audit-chip">Provider: {{ r.provider }}</span>
          <span class="audit-chip">Model: {{ r.model }}</span>
          <span class="audit-chip">{{ r.executionTimeMs }} ms</span>
          @if (r.approvalRequired) {
            <span class="audit-chip approval">Approval Required</span>
          }
        </div>
      }

      @if (!result() && !loading() && !errorMsg()) {
        <div class="idle-state">
          <mat-icon>insights</mat-icon>
          <p>Select a device to run lifecycle analysis and view recommendation output.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .ai-panel {
      background: var(--app-card-bg);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .ai-panel__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .ai-panel__title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .ai-panel__sub {
      font-size: 0.78rem;
      color: var(--app-text-muted);
      margin-top: 0.1rem;
    }

    .analyze-btn {
      background: var(--app-primary) !important;
      color: #080c14 !important;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .panel-section {
      border: 1px solid var(--app-border);
      border-radius: 0.65rem;
      padding: 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .panel-section h4 {
      margin: 0;
      color: var(--app-text);
      font-size: 0.82rem;
      font-weight: 700;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 0.6rem;
      padding: 0.26rem 0;
      border-bottom: 1px solid var(--app-border);
    }

    .detail-row:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .detail-row span {
      color: var(--app-text-muted);
      font-size: 0.78rem;
    }

    .detail-row strong {
      color: var(--app-text);
      font-size: 0.8rem;
      text-align: right;
    }

    .reasoning-block {
      margin: 0;
      border: 1px solid var(--app-border);
      border-radius: 0.55rem;
      padding: 0.55rem;
      color: var(--app-text-secondary);
      font-size: 0.8rem;
      line-height: 1.45;
      background: rgba(255, 255, 255, 0.01);
    }

    .supporting-note {
      margin: 0;
      color: var(--app-text-secondary);
      font-size: 0.8rem;
      line-height: 1.45;
    }

    .action-row {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .export-btn {
      border-color: var(--app-border) !important;
      color: var(--app-text-muted) !important;
    }

    .simulation-panel {
      margin-top: 0.2rem;
      border: 1px solid var(--app-border);
      border-radius: 0.55rem;
      padding: 0.55rem;
      display: flex;
      flex-direction: column;
      gap: 0.38rem;
      background: rgba(34, 197, 94, 0.06);
    }

    .simulation-step {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--app-text-muted);
      font-size: 0.78rem;
    }

    .simulation-step.is-complete {
      color: #86efac;
    }

    .step-icon {
      font-size: 0.86rem;
      line-height: 1;
    }

    .simulation-done {
      color: var(--app-success);
      font-size: 0.8rem;
      font-weight: 700;
      padding-top: 0.1rem;
    }

    .analyze-btn mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .error-banner {
      padding: 0.75rem 1rem;
      border-radius: var(--app-radius-sm);
      background: var(--app-danger-soft);
      border: 1px solid rgba(239,68,68,0.3);
      color: var(--app-danger);
      font-size: 0.85rem;
    }

    .audit-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .audit-chip {
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 600;
      background: var(--app-surface-strong);
      border: 1px solid var(--app-border);
      color: var(--app-text-muted);
    }

    .audit-chip.approval {
      background: var(--app-warning-soft);
      color: var(--app-warning);
      border-color: rgba(249,115,22,0.3);
    }

    .idle-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      text-align: center;
      color: var(--app-text-muted);
    }

    .idle-state mat-icon {
      font-size: 1.4rem;
      width: 1.4rem;
      height: 1.4rem;
      opacity: 0.5;
    }

    .idle-state p {
      margin: 0;
      font-size: 0.88rem;
      line-height: 1.6;
      max-width: 28rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecycleAiPanelComponent {
  readonly device = input<DeviceLifecycleSummary | null>(null);
  readonly decisionComplete = output<DecisionResponse>();
  readonly triggerAnalyze = input(false);

  protected readonly loading = signal(false);
  protected readonly result = signal<DecisionResponse | null>(null);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly simulationVisible = signal(false);
  protected readonly simulationRunning = signal(false);
  protected readonly simulationComplete = signal(false);
  protected readonly simulationStepIndex = signal(-1);

  protected readonly simulationSteps = [
    'Creating Change Request',
    'Updating Lifecycle Record',
    'Assigning Platform Team',
    'Recording AI Decision'
  ];

  protected readonly confidenceLabel = computed(() => {
    const confidence = this.result()?.confidence;
    return typeof confidence === 'number' ? `${confidence}%` : 'No data available';
  });

  constructor(private readonly api: LifecycleApiService) {
    effect(() => {
      if (this.triggerAnalyze() && this.device() && !this.loading()) {
        this.analyze();
      }
    });
  }

  protected analyze() {
    const d = this.device();
    if (!d) return;
    this.loading.set(true);
    this.result.set(null);
    this.errorMsg.set(null);

    this.api.executeDecision(d.deviceId).subscribe({
      next: (r) => {
        this.result.set(r);
        this.decisionComplete.emit(r);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.errorMsg.set(err.message);
        this.loading.set(false);
      },
    });
  }

  protected daysToEolLabel(): string {
    const days = this.device()?.daysUntilUnsupported;
    if (days === undefined || days === null) {
      return 'No data available';
    }
    if (days < 0) {
      return 'Past EOL';
    }
    return `${days} days`;
  }

  protected simulateApplyRecommendation(): void {
    this.simulationVisible.set(true);
    this.simulationRunning.set(true);
    this.simulationComplete.set(false);
    this.simulationStepIndex.set(-1);

    this.simulationSteps.forEach((_, index) => {
      window.setTimeout(() => {
        this.simulationStepIndex.set(index);
        if (index === this.simulationSteps.length - 1) {
          this.simulationRunning.set(false);
          this.simulationComplete.set(true);
        }
      }, index * 500);
    });
  }

}
