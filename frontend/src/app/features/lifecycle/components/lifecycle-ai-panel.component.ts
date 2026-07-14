import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecisionResponse } from '../../../core/models/decision-response.model';
import { DeviceLifecycleSummary } from '../../../core/models/lifecycle.model';
import { LifecycleApiService } from '../../../core/services/lifecycle-api.service';

@Component({
  selector: 'app-lifecycle-ai-panel',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="ai-panel">
      <div class="ai-panel__header">
        <div class="ai-panel__title-row">
          <mat-icon class="ai-icon">psychology</mat-icon>
          <div>
            <div class="ai-panel__title">Lifecycle AI Decision Engine</div>
            <div class="ai-panel__sub">Explainable upgrade recommendations powered by AI</div>
          </div>
        </div>
        <button
          mat-flat-button
          class="analyze-btn"
          [disabled]="loading() || !device()"
          (click)="analyze()"
        >
          @if (loading()) {
            <mat-spinner diameter="16" />
            Analysing…
          } @else {
            <mat-icon>bolt</mat-icon>
            Analyse Lifecycle
          }
        </button>
      </div>

      @if (errorMsg()) {
        <div class="error-banner">{{ errorMsg() }}</div>
      }

      @if (result(); as r) {
        <div class="result-grid">
          <div class="result-card primary-rec">
            <div class="rec-label">Recommendation</div>
            <div class="rec-value">{{ r.recommendation }}</div>
            @if (r.summary) {
              <div class="rec-summary">{{ r.summary }}</div>
            }
          </div>

          <div class="result-card">
            <div class="rec-label">Risk Level</div>
            <div class="risk-chip" [class]="riskClass(r.risk)">{{ r.risk ?? '—' }}</div>
          </div>

          <div class="result-card">
            <div class="rec-label">Confidence</div>
            <div class="confidence-bar-wrap">
              <div class="confidence-fill" [style.width]="r.confidence + '%'"></div>
            </div>
            <div class="confidence-value">{{ r.confidence | number:'1.0-0' }}%</div>
          </div>

          <div class="result-card">
            <div class="rec-label">Business Impact</div>
            <div class="rec-value-sm">{{ r.businessImpact }}</div>
          </div>

          @if (r.recommendedVersion) {
            <div class="result-card">
              <div class="rec-label">Recommended Version</div>
              <div class="rec-value-sm version-chip">{{ r.recommendedVersion }}</div>
            </div>
          }

          @if (r.recommendedWindow) {
            <div class="result-card">
              <div class="rec-label">Maintenance Window</div>
              <div class="rec-value-sm">{{ r.recommendedWindow }}</div>
            </div>
          }
        </div>

        @if (r.evidence?.length) {
          <div class="justification">
            <div class="just-title">Justification</div>
            <ul class="just-list">
              @for (item of r.evidence; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>
        }

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
          <p>Select a device and click <strong>Analyse Lifecycle</strong> to get an AI-powered upgrade recommendation.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .ai-panel {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ai-panel__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .ai-panel__title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .ai-icon {
      color: var(--app-primary);
      font-size: 1.8rem;
      width: 1.8rem;
      height: 1.8rem;
    }

    .ai-panel__title {
      font-size: 0.95rem;
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
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.4rem;
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

    .result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
    }

    .result-card {
      background: var(--app-surface-strong);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .result-card.primary-rec {
      grid-column: 1 / -1;
      background: var(--app-primary-soft);
      border-color: var(--app-border-accent);
    }

    .rec-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--app-text-muted);
    }

    .rec-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .rec-summary {
      font-size: 0.82rem;
      color: var(--app-text-secondary);
      line-height: 1.5;
    }

    .rec-value-sm {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--app-text);
    }

    .version-chip {
      font-family: monospace;
      color: var(--app-accent);
    }

    .risk-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      width: fit-content;
    }

    .risk-critical { background: var(--app-danger-soft);  color: var(--app-danger);  border: 1px solid rgba(239,68,68,0.3); }
    .risk-high     { background: var(--app-warning-soft); color: var(--app-warning); border: 1px solid rgba(249,115,22,0.3); }
    .risk-medium   { background: rgba(234,179,8,0.12);    color: #eab308;            border: 1px solid rgba(234,179,8,0.3); }
    .risk-low      { background: var(--app-success-soft); color: var(--app-success); border: 1px solid rgba(34,197,94,0.3); }

    .confidence-bar-wrap {
      height: 0.45rem;
      background: var(--app-border);
      border-radius: 99px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      background: var(--app-success);
      border-radius: 99px;
      transition: width 0.5s ease;
    }

    .confidence-value {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .justification {
      background: var(--app-surface-strong);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      padding: 0.85rem 1rem;
    }

    .just-title {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--app-text-muted);
      margin-bottom: 0.5rem;
    }

    .just-list {
      margin: 0;
      padding-left: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .just-list li {
      font-size: 0.84rem;
      color: var(--app-text-secondary);
      line-height: 1.5;
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
      font-size: 2.2rem;
      width: 2.2rem;
      height: 2.2rem;
      opacity: 0.4;
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

  protected readonly loading = signal(false);
  protected readonly result = signal<DecisionResponse | null>(null);
  protected readonly errorMsg = signal<string | null>(null);

  constructor(private readonly api: LifecycleApiService) {}

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

  protected riskClass(risk?: string): string {
    return 'risk-' + (risk ?? 'low').toLowerCase();
  }
}
