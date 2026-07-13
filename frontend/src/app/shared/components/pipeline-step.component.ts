import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pipeline-step',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div class="pipeline-step">
      <mat-card class="pipeline-step__card">
        <div class="pipeline-step__icon" aria-hidden="true">
          <mat-icon>check_circle</mat-icon>
        </div>
        <div class="pipeline-step__content">
          <div class="pipeline-step__label">{{ label() }}</div>
          <div class="pipeline-step__description">{{ description() }}</div>
        </div>
      </mat-card>
    </div>
  `,
  styles: `
    .pipeline-step {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pipeline-step__card {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.9rem 1rem;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      box-shadow: none;
      min-width: 180px;
      max-width: 220px;
    }

    .pipeline-step__icon {
      color: var(--app-success);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pipeline-step__content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .pipeline-step__label {
      color: var(--app-text);
      font-weight: 700;
      font-size: 0.95rem;
    }

    .pipeline-step__description {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      line-height: 1.4;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PipelineStepComponent {
  readonly label = input.required<string>();
  readonly description = input.required<string>();
}
