import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IncidentSummary } from '../../../core/models/incident-summary.model';

@Component({
  selector: 'app-incident-queue',
  standalone: true,
  template: `
    <section class="queue-card">
      <div class="queue-card__header">
        <div>
          <h3>Operational Incidents</h3>
          <p>Choose an incident to guide the AI-assisted remediation workflow.</p>
        </div>
      </div>

      <div class="queue-table">
        <div class="queue-table__row queue-table__row--head">
          <span>Incident</span>
          <span>Severity</span>
          <span>Device</span>
          <span>Business Service</span>
          <span>Created</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        @for (incident of incidents(); track incident.id) {
          <div class="queue-table__row" [class.is-selected]="selectedIncident()?.id === incident.id" [class.is-disabled]="disabled()">
            <span>{{ incident.id }}</span>
            <span>{{ incident.severity }}</span>
            <span>{{ incident.device }}</span>
            <span>{{ incident.businessService || 'Pending' }}</span>
            <span>{{ incident.createdAt }}</span>
            <span>{{ incident.status }}</span>
            <button type="button" (click)="incidentSelected.emit(incident)" [disabled]="disabled()">Analyze</button>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .queue-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      padding: 1rem;
    }

    .queue-card__header h3 {
      margin: 0 0 0.25rem;
      color: var(--app-text);
      font-size: 1.02rem;
      font-weight: 700;
    }

    .queue-card__header p {
      margin: 0 0 1rem;
      color: var(--app-text-muted);
      font-size: 0.9rem;
    }

    .queue-table {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .queue-table__row {
      display: grid;
      grid-template-columns: 1.1fr 0.7fr 0.8fr 1fr 0.8fr 0.8fr 0.65fr;
      gap: 0.7rem;
      align-items: center;
      padding: 0.75rem 0.8rem;
      border: 1px solid var(--app-border);
      border-radius: 0.8rem;
      background: rgba(255,255,255,0.02);
      color: #e0e7ff;
    }

    .queue-table__row--head {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #a5b4fc;
      border: 0;
      background: transparent;
      padding: 0 0.2rem;
    }

    .queue-table__row.is-selected {
      border-color: var(--app-primary);
      box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.24);
    }

    .queue-table__row.is-disabled {
      opacity: 0.72;
    }

    .queue-table__row button {
      border: 0;
      border-radius: 999px;
      padding: 0.4rem 0.75rem;
      background: var(--app-primary);
      color: white;
      cursor: pointer;
    }

    .queue-table__row button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentQueueComponent {
  readonly incidents = input.required<IncidentSummary[]>();
  readonly selectedIncident = input<IncidentSummary | null>(null);
  readonly disabled = input(false);
  readonly incidentSelected = output<IncidentSummary>();
}
