import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="metric-card">
      <div class="metric-card__icon" aria-hidden="true">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <div class="metric-card__content">
        <div class="metric-card__title">{{ title() }}</div>
        <div class="metric-card__value">{{ value() }}</div>
      </div>
    </mat-card>
  `,
  styles: `
    .metric-card {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 1rem 1.1rem;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      box-shadow: none;
      height: 100%;
    }

    .metric-card__icon {
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 0.9rem;
      display: grid;
      place-items: center;
      background: var(--app-primary-soft);
      color: var(--app-primary);
      flex-shrink: 0;
    }

    .metric-card__content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }

    .metric-card__title {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--app-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-card__value {
      font-size: 1.14rem;
      font-weight: 700;
      color: var(--app-text);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input.required<string>();
}
