import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { DecisionResponse } from '../../../core/models/decision-response.model';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatIconModule, DecimalPipe],
  template: `
    <mat-card class="recommendation-card">
      <div class="recommendation-card__header">
        <div>
          <h3>AI Recommendation</h3>
          <p>Explainable response guidance generated from operational evidence.</p>
        </div>
        <div class="confidence-pill">{{ response()?.confidence ? (response()?.confidence | number:'1.0-0') + '%' : 'Pending' }} confidence</div>
      </div>

      <div class="recommendation-card__body">
        <div class="recommendation-card__title">{{ response()?.recommendation || 'Waiting for analysis…' }}</div>
        <div class="recommendation-card__reasoning">
          {{ response()?.reasoning || 'The recommendation will appear here once the backend responds.' }}
        </div>
        <div class="recommendation-card__meta">
          <div><span>Business Impact</span><strong>{{ response()?.businessImpact || 'Pending' }}</strong></div>
          <div><span>Potential Impact</span><strong>{{ response()?.businessImpact || 'Pending' }}</strong></div>
          <div><span>Evidence</span><strong>{{ response()?.evidence?.join(', ') || 'Pending' }}</strong></div>
          <div><span>Approval Required</span><strong>{{ response()?.approvalRequired ? 'Yes' : 'No' }}</strong></div>
        </div>
      </div>

      @if (response()) {
        <div class="detail-grid">
          <div><span>Decision ID</span><strong>{{ response()?.decisionId }}</strong></div>
          <div><span>Provider</span><strong>{{ response()?.provider }}</strong></div>
          <div><span>Model</span><strong>{{ response()?.model }}</strong></div>
          <div><span>Latency</span><strong>{{ response()?.executionTimeMs }} ms</strong></div>
        </div>
      }

      <div class="chip-row">
        <mat-chip>Enterprise Decision</mat-chip>
        <mat-chip>Traceable</mat-chip>
        <mat-chip>Explainable</mat-chip>
      </div>
    </mat-card>
  `,
  styles: `
    .recommendation-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      box-shadow: none;
      padding: 1rem;
      height: 100%;
    }

    .recommendation-card__header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .recommendation-card__header h3 {
      margin: 0 0 0.25rem;
      color: var(--app-text);
      font-size: 1.02rem;
      font-weight: 700;
    }

    .recommendation-card__header p {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .confidence-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.4rem 0.65rem;
      border-radius: 999px;
      background: rgba(34, 197, 94, 0.16);
      color: var(--app-success);
      font-size: 0.78rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .recommendation-card__title {
      color: var(--app-text);
      font-size: 1.04rem;
      font-weight: 700;
      margin-bottom: 0.7rem;
      line-height: 1.45;
    }

    .recommendation-card__reasoning {
      color: var(--app-text-muted);
      margin-bottom: 0.9rem;
      line-height: 1.55;
      font-size: 0.92rem;
    }

    .recommendation-card__meta {
      display: grid;
      gap: 0.55rem;
      margin-bottom: 0.9rem;
    }

    .recommendation-card__meta div {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .recommendation-card__meta span {
      color: var(--app-text-muted);
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .recommendation-card__meta strong {
      color: var(--app-text);
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.65rem;
      margin-bottom: 0.9rem;
      padding-top: 0.4rem;
      border-top: 1px solid var(--app-border);
    }

    .detail-grid div {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .detail-grid span {
      color: var(--app-text-muted);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .detail-grid strong {
      color: var(--app-text);
      font-size: 0.82rem;
      line-height: 1.4;
      word-break: break-word;
    }

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    mat-chip {
      background: var(--app-primary-soft);
      color: var(--app-text);
      border: 1px solid var(--app-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationCardComponent {
  readonly response = input<DecisionResponse | null>(null);
}
