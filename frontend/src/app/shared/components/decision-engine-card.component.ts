import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { StatusChipComponent } from './status-chip.component';
import { DecisionEngine } from '../models/decision-engine.model';

@Component({
  selector: 'app-decision-engine-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink, StatusChipComponent],
  template: `
    <mat-card class="engine-card">
      <div class="engine-card__header">
        <div class="engine-card__icon" aria-hidden="true">
          <mat-icon>{{ engine().icon }}</mat-icon>
        </div>
        <app-status-chip [status]="engine().status" />
      </div>

      <mat-card-title>{{ engine().title }}</mat-card-title>
      <mat-card-content>
        <p>{{ engine().description }}</p>
      </mat-card-content>

      <div class="engine-card__metrics">
        <div class="metric-row">
          <span class="metric-label">Today's Decisions</span>
          <span class="metric-value">{{ engine().metrics?.today ?? '—' }}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Average Confidence</span>
          <span class="metric-value">{{ engine().metrics?.confidence ?? '—' }}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Average Response</span>
          <span class="metric-value">{{ engine().metrics?.response ?? '—' }}</span>
        </div>
      </div>

      <mat-card-actions align="end">
        <a matButton [routerLink]="engine().route" [disabled]="engine().status === 'COMING SOON'">
          Open
        </a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .engine-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      padding: 1rem;
      box-shadow: none;
    }

    .engine-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .engine-card__icon {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.9rem;
      display: grid;
      place-items: center;
      background: var(--app-primary-soft);
      color: var(--app-primary);
    }

    mat-card-title {
      margin-bottom: 0.6rem;
      font-size: 1rem;
      color: var(--app-text);
    }

    mat-card-content {
      padding-bottom: 0.5rem;
    }

    mat-card-content p {
      margin: 0;
      color: var(--app-text-muted);
      line-height: 1.55;
      font-size: 0.9rem;
    }

    .engine-card__metrics {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      padding: 0.7rem 0 0.9rem;
      border-top: 1px solid var(--app-border);
      margin-top: 0.25rem;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
      font-size: 0.8rem;
    }

    .metric-label {
      color: var(--app-text-muted);
    }

    .metric-value {
      color: var(--app-text);
      font-weight: 600;
    }

    mat-card-actions {
      margin-top: auto;
      padding: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecisionEngineCardComponent {
  readonly engine = input.required<DecisionEngine>();
  readonly open = output<void>();
}
