import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DecisionEvidenceItem } from '../../core/models/decision-response.model';

@Component({
  selector: 'app-ai-evidence-panel',
  standalone: true,
  template: `
    @if (items().length) {
      <section class="evidence-panel">
        <button type="button" class="evidence-toggle" (click)="toggle()" [attr.aria-expanded]="expanded()">
          <span>Evidence Used</span>
          <span class="toggle-label">{{ expanded() ? 'Collapse' : 'Expand' }}</span>
        </button>

        @if (expanded()) {
          <div class="evidence-list">
            @for (item of items(); track item.title + '-' + item.category + '-' + item.source) {
              <article class="evidence-item">
                <div class="evidence-title-row">
                  <span class="check">✓</span>
                  <div class="title-wrap">
                    <h4>{{ item.title }}</h4>
                    <p class="meta">{{ item.category }} • {{ item.source }}</p>
                  </div>
                </div>

                <p class="summary">{{ item.summary }}</p>

                @if (item.referenceUrl) {
                  <a class="ref-link" [href]="item.referenceUrl" target="_blank" rel="noopener noreferrer">
                    Reference
                  </a>
                }
              </article>
            }
          </div>
        }
      </section>
    }
  `,
  styles: `
    .evidence-panel {
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      background: rgba(255, 255, 255, 0.01);
      overflow: hidden;
    }

    .evidence-toggle {
      width: 100%;
      border: 0;
      border-bottom: 1px solid var(--app-border);
      background: transparent;
      color: var(--app-text-secondary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.55rem 0.7rem;
      font-size: 0.72rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      font-weight: 700;
    }

    .toggle-label {
      color: var(--app-text-muted);
      text-transform: none;
      letter-spacing: 0;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .evidence-list {
      padding: 0.3rem 0.6rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .evidence-item {
      border: 1px solid var(--app-border);
      border-radius: 0.45rem;
      padding: 0.45rem 0.55rem;
      background: var(--app-card-bg);
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .evidence-title-row {
      display: flex;
      gap: 0.45rem;
      align-items: flex-start;
    }

    .check {
      font-size: 0.78rem;
      color: var(--app-text-secondary);
      line-height: 1.3;
    }

    .title-wrap h4 {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 650;
      color: var(--app-text);
      line-height: 1.35;
    }

    .meta {
      margin: 0.1rem 0 0;
      font-size: 0.68rem;
      color: var(--app-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .summary {
      margin: 0;
      font-size: 0.74rem;
      color: var(--app-text-secondary);
      line-height: 1.45;
    }

    .ref-link {
      color: var(--app-text-muted);
      font-size: 0.7rem;
      text-decoration: underline;
      width: fit-content;
    }

    .ref-link:hover {
      color: var(--app-text);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AIEvidencePanelComponent {
  readonly items = input<DecisionEvidenceItem[]>([]);
  protected readonly expanded = signal(false);

  protected toggle() {
    this.expanded.update((value) => !value);
  }
}