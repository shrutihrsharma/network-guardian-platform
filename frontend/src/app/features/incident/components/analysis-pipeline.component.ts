import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface AnalysisPipelineStep {
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed';
}

@Component({
  selector: 'app-analysis-pipeline',
  standalone: true,
  imports: [TitleCasePipe],
  template: `
    <section class="pipeline-card">
      <div class="pipeline-card__header">
        <h3>AI Analysis Workflow</h3>
        <p>The system is reasoning through the incident step by step.</p>
      </div>

      <div class="pipeline-card__steps">
        @for (step of steps(); track step.title) {
          <div class="step-card">
            <div class="step-card__icon" [class.is-running]="step.status === 'running'" [class.is-completed]="step.status === 'completed'">
              @if (step.status === 'completed') {
                <span>✓</span>
              } @else if (step.status === 'running') {
                <span>⏳</span>
              } @else {
                <span>•</span>
              }
            </div>
            <div class="step-card__content">
              <div class="step-card__title">{{ step.title }}</div>
              <div class="step-card__description">{{ step.description }}</div>
              <div class="step-card__status">{{ step.status | titlecase }}</div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .pipeline-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      padding: 1rem;
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
    }

    .pipeline-card__steps {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .step-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      border: 1px solid var(--app-border);
      border-radius: 0.9rem;
      padding: 0.75rem;
      background: rgba(255,255,255,0.02);
    }

    .step-card__icon {
      width: 1.8rem;
      height: 1.8rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.06);
      color: var(--app-text-muted);
      font-weight: 700;
    }

    .step-card__icon.is-running {
      color: var(--app-primary);
      animation: pulse 1s infinite;
    }

    .step-card__icon.is-completed {
      color: var(--app-success);
      background: rgba(34, 197, 94, 0.16);
    }

    .step-card__content {
      flex: 1;
    }

    .step-card__title {
      color: #e0e7ff;
      font-weight: 700;
      margin-bottom: 0.2rem;
    }

    .step-card__description {
      color: #cbd5e1;
      font-size: 0.82rem;
      line-height: 1.45;
      margin-bottom: 0.25rem;
    }

    .step-card__status {
      color: var(--app-text-muted);
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysisPipelineComponent {
  readonly steps = input.required<AnalysisPipelineStep[]>();
}
