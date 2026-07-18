import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AiRecommendationPanelComponent } from '../../../shared/components/ai-recommendation-panel.component';
import { ComplianceApiService } from '../../../core/services/compliance-api.service';
import { DecisionResponse } from '../../../core/models/decision-response.model';

@Component({
  selector: 'app-compliance-ai-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, AiRecommendationPanelComponent],
  template: `
    <section class="ai-panel">
      <div class="ai-panel__header">
        <div class="title-wrap">
          <mat-icon>policy</mat-icon>
          <div>
            <h3>Compliance Recommendation</h3>
            <p>Run analysis to get a prioritized remediation recommendation.</p>
          </div>
        </div>

        <button mat-flat-button class="analyze-btn" [disabled]="loading()" (click)="analyze()">
          @if (loading()) {
            <mat-spinner diameter="16" />
            Analyzing...
          } @else {
            <ng-container>
              <mat-icon>play_circle</mat-icon>
            </ng-container>
            Analyze Compliance
          }
        </button>
      </div>

      @if (errorMsg()) {
        <div class="error-banner">{{ errorMsg() }}</div>
      }

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="16" />
          <span>Analyzing KRIs, devices, lifecycle, and incidents...</span>
        </div>
      }

      @if (result(); as r) {
        <app-ai-recommendation-panel [response]="r" [suggestedActions]="remediationItems()" />

        <div class="meta-row">
          <span>Decision ID: {{ r.decisionId }}</span>
          <span>Provider: {{ r.provider }}</span>
          <span>Model: {{ r.model }}</span>
          <span>Latency: {{ r.executionTimeMs }} ms</span>
        </div>
      }
    </section>
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
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .title-wrap {
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
    }

    .title-wrap mat-icon {
      color: var(--app-primary);
      margin-top: 0.1rem;
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .title-wrap h3 {
      margin: 0;
      font-size: 0.95rem;
      color: var(--app-text);
    }

    .title-wrap p {
      margin: 0.2rem 0 0;
      font-size: 0.78rem;
      color: var(--app-text-muted);
    }

    .analyze-btn {
      background: var(--app-primary) !important;
      color: #0b1220 !important;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .loading-state {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--app-text-secondary);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      padding: 0.55rem 0.65rem;
      background: var(--app-surface-strong);
    }

    .error-banner {
      padding: 0.7rem 0.9rem;
      border-radius: var(--app-radius-sm);
      border: 1px solid rgba(239, 68, 68, 0.35);
      background: var(--app-danger-soft);
      color: var(--app-danger);
      font-size: 0.82rem;
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .meta-row span {
      font-size: 0.68rem;
      color: var(--app-text-muted);
      padding: 0.2rem 0.5rem;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      background: var(--app-surface-strong);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceAiPanelComponent {
  readonly deviceId = input<string | null>(null);
  readonly triggerAnalyze = input(false);
  readonly decisionComplete = output<DecisionResponse>();

  protected readonly loading = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly result = signal<DecisionResponse | null>(null);

  protected readonly remediationItems = signal<string[]>([]);

  constructor(private readonly complianceApi: ComplianceApiService) {
    effect(() => {
      if (this.triggerAnalyze() && !this.loading()) {
        this.analyze();
      }
    });
  }

  protected analyze() {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.result.set(null);
    this.remediationItems.set([]);

    this.complianceApi.analyzeCompliance({ deviceId: this.deviceId() ?? undefined }).subscribe({
      next: (response) => {
        this.result.set(response);
        this.remediationItems.set(
          (response.reasoning ?? '')
            .split('|')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        );
        this.decisionComplete.emit(response);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.errorMsg.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
