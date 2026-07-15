import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AiRecommendationPanelComponent } from '../../../shared/components/ai-recommendation-panel.component';
import { DecisionResponse } from '../../../core/models/decision-response.model';
import { DeviceLifecycleSummary } from '../../../core/models/lifecycle.model';
import { LifecycleApiService } from '../../../core/services/lifecycle-api.service';

@Component({
  selector: 'app-lifecycle-ai-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, AiRecommendationPanelComponent],
  template: `
    <div class="ai-panel">
      <div class="ai-panel__header">
        <div class="ai-panel__title-row">
          <mat-icon class="ai-icon">smart_toy</mat-icon>
          <div>
            <div class="ai-panel__title">Lifecycle AI Decision Engine</div>
            <div class="ai-panel__sub">Lifecycle recommendation generated from current backend context.</div>
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

      @if (result(); as r) {
        <app-ai-recommendation-panel [response]="r" />

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
          <p>Select a device and click <strong>Analyze Lifecycle</strong> to view recommendation output.</p>
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
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
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
      font-weight: 600;
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

}
