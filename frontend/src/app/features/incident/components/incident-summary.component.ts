import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { IncidentSummary } from '../../../core/models/incident-summary.model';

@Component({
  selector: 'app-incident-summary',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatChipsModule, MatIconModule],
  template: `
    <mat-card class="summary-card">
      <div class="summary-card__header">
        <div>
          <h3>Current Incident</h3>
          <p>Operational context captured for decision support.</p>
        </div>
      </div>

      @if (selectedIncident()) {
        <div class="summary-card__body">
          <div class="summary-row"><span>Incident</span><strong>{{ selectedIncident()?.id }}</strong></div>
          <div class="summary-row"><span>Device</span><strong>{{ selectedIncident()?.device }}</strong></div>
          <div class="summary-row"><span>Business Service</span><strong>{{ selectedIncident()?.businessService || 'Pending' }}</strong></div>
          <div class="summary-row"><span>Vendor</span><strong>{{ selectedIncident()?.vendor || 'Pending' }}</strong></div>
          <div class="summary-row"><span>Status</span><strong>{{ selectedIncident()?.status }}</strong></div>
          <div class="summary-row"><span>Severity</span><strong>{{ selectedIncident()?.severity }}</strong></div>
          <div class="summary-row"><span>Created</span><strong>{{ selectedIncident()?.createdAt }}</strong></div>
        </div>
      } @else {
        <div class="summary-card__empty">Select an incident from the queue to analyze it.</div>
      }

      <div class="summary-card__footer">
        <button mat-flat-button color="primary" (click)="analyze.emit()" [disabled]="isLoading()">
          @if (isLoading()) {
            <span>Analyzing…</span>
          } @else {
            <span>Analyze Incident</span>
          }
        </button>
      </div>
    </mat-card>
  `,
  styles: `
    .summary-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      box-shadow: none;
      padding: 1rem;
      height: 100%;
    }

    .summary-card__header h3 {
      margin: 0 0 0.25rem;
      color: var(--app-text);
      font-size: 1.02rem;
      font-weight: 700;
    }

    .summary-card__header p {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .summary-card__body {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      margin: 1rem 0;
    }

    .summary-row {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--app-border);
    }

    .summary-row:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .summary-row span {
      color: var(--app-text-muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .summary-row strong {
      color: var(--app-text);
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .summary-card__footer {
      margin-top: 0.5rem;
      display: flex;
      justify-content: flex-start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentSummaryComponent {
  readonly isLoading = input(false);
  readonly selectedIncident = input<IncidentSummary | null>(null);
  readonly analyze = output<void>();
}
