import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DecisionResponse } from '../../core/models/decision-response.model';

@Component({
  selector: 'app-ai-recommendation-panel',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="ai-rec-panel">
      @if (response(); as r) {
        <div class="row primary">
          <span>Recommendation</span>
          <strong>{{ r.recommendation || 'No data available' }}</strong>
        </div>

        <div class="grid">
          <div class="cell">
            <span>Risk</span>
            <strong>{{ r.risk || 'No data available' }}</strong>
          </div>
          <div class="cell">
            <span>Confidence</span>
            <strong>{{ r.confidence | number:'1.0-0' }}%</strong>
          </div>
          <div class="cell">
            <span>Business Impact</span>
            <strong>{{ r.businessImpact || 'No data available' }}</strong>
          </div>
        </div>

        <div class="row">
          <span>Evidence</span>
          @if (r.evidence.length) {
            <ul>
              @for (item of r.evidence; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          } @else {
            <p>No data available</p>
          }
        </div>

        <div class="row">
          <span>Suggested Actions</span>
          @if (actions().length) {
            <ol>
              @for (item of actions(); track item) {
                <li>{{ item }}</li>
              }
            </ol>
          } @else {
            <p>No data available</p>
          }
        </div>
      } @else {
        <p class="empty">No data available</p>
      }
    </section>
  `,
  styles: `
    .ai-rec-panel {
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      background: var(--app-surface);
      padding: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .row.primary strong {
      font-size: 0.95rem;
      color: var(--app-text);
    }

    .row span,
    .cell span {
      font-size: 0.67rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--app-text-muted);
      font-weight: 700;
    }

    .cell strong,
    .row p,
    .row li {
      color: var(--app-text-secondary);
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.55rem;
    }

    .cell {
      border: 1px solid var(--app-border);
      border-radius: 0.45rem;
      padding: 0.55rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      background: var(--app-card-bg);
    }

    ul, ol {
      margin: 0;
      padding-left: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .empty {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.82rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiRecommendationPanelComponent {
  readonly response = input<DecisionResponse | null>(null);
  readonly suggestedActions = input<string[] | null>(null);

  readonly actions = computed(() => {
    const provided = this.suggestedActions();
    if (provided && provided.length) {
      return provided;
    }

    const reasoning = this.response()?.reasoning ?? '';
    return reasoning
      .split('|')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 6);
  });
}
