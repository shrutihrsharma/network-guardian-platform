import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-section-card',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card class="section-card">
      <div class="section-card__header">
        <h3>{{ title() }}</h3>
        @if (description()) {
          <p>{{ description() }}</p>
        }
      </div>
      <div class="section-card__content">
        <ng-content />
      </div>
    </mat-card>
  `,
  styles: `
    .section-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      box-shadow: none;
      padding: 1rem;
      height: 100%;
    }

    .section-card__header {
      margin-bottom: 0.8rem;
    }

    h3 {
      margin: 0;
      font-size: 0.98rem;
      color: var(--app-text);
    }

    p {
      margin: 0.35rem 0 0;
      color: var(--app-text-muted);
      font-size: 0.85rem;
      line-height: 1.45;
    }

    .section-card__content {
      color: var(--app-text);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionCardComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
}
