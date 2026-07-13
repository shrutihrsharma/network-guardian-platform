import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PipelineStepComponent } from './pipeline-step.component';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [MatCardModule, PipelineStepComponent],
  template: `
    <mat-card class="pipeline-card">
      <div class="pipeline-card__header">
        <h3>AI Reasoning Pipeline</h3>
        <p>Each layer contributes explainable evidence to the final recommendation.</p>
      </div>

      <div class="pipeline-card__steps">
        @for (step of steps(); track step.title) {
          <app-pipeline-step [title]="step.title" [description]="step.description" [completed]="step.completed" />
        }
      </div>
    </mat-card>
  `,
  styles: `
    .pipeline-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      box-shadow: none;
      padding: 1rem;
      height: 100%;
    }

    .pipeline-card__header h3 {
      margin: 0 0 0.25rem;
      color: var(--app-text);
      font-size: 1.02rem;
      font-weight: 700;
    }

    .pipeline-card__header p {
      margin: 0 0 1rem;
      color: var(--app-text-muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .pipeline-card__steps {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PipelineComponent {
  readonly steps = input.required<Array<{ title: string; description: string; completed: boolean }>>();
}
