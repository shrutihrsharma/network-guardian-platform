import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pipeline-step',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="step-card">
      <div class="step-card__icon" aria-hidden="true">
        <mat-icon>{{ completed() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
      </div>
      <div class="step-card__content">
        <div class="step-card__title">{{ title() }}</div>
        <div class="step-card__description">{{ description() }}</div>
        <div class="step-card__status" [class.active]="completed()">{{ completed() ? 'Completed' : 'Pending' }}</div>
      </div>
    </mat-card>
  `,
  styles: `
    .step-card {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      padding: 0.9rem;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 0.95rem;
      box-shadow: none;
      min-height: 110px;
    }

    .step-card__icon {
      color: var(--app-success);
      margin-top: 0.1rem;
    }

    .step-card__content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .step-card__title {
      color: var(--app-text);
      font-weight: 700;
      font-size: 0.95rem;
    }

    .step-card__description {
      color: var(--app-text-muted);
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .step-card__status {
      margin-top: 0.2rem;
      color: var(--app-text-muted);
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .step-card__status.active {
      color: var(--app-success);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PipelineStepComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly completed = input(false);
}
