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
        </div>
      </div>

      <div class="queue-table">
        <div class="queue-table__row queue-table__row--head">
          <span>Incident ID</span>
          <span>Severity</span>
          <span>Status</span>
          <span>Business Service</span>
          <span>Primary Device</span>
          <span>Created</span>
          <span>Affected Devices</span>
          <span>AI Status</span>
          <span>Action</span>
        </div>
        @for (incident of incidents(); track incident.id) {
          <div class="queue-table__row" [class.is-selected]="selectedIncident()?.id === incident.id" [class.is-disabled]="disabled()">
            <span>{{ incident.id }}</span>
            <span [class.is-critical]="incident.severity.toLowerCase() === 'critical'">{{ incident.severity || 'Unknown' }}</span>
            <span>{{ incident.status || 'Unknown' }}</span>
            <span>{{ incident.businessService || 'No data available' }}</span>
            <span>{{ incident.device || 'No data available' }}</span>
            <span>{{ incident.createdAt }}</span>
            <span>{{ affectedDeviceCounts()[incident.id] || 0 }}</span>
            <span>{{ aiStatuses()[incident.id] || 'Pending' }}</span>
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
      grid-template-columns: minmax(112px, 1fr) 88px 92px minmax(144px, 1.1fr) minmax(140px, 1fr) 132px 132px 100px 96px;
      gap: 0.65rem;
      align-items: center;
      padding: 0.75rem 0.8rem;
      border: 1px solid var(--app-border);
      border-radius: 0.8rem;
      background: var(--app-surface-mid);
      color: var(--app-text);
      font-size: 0.86rem;
    }

    .queue-table__row--head {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--app-text-muted);
      border: 0;
      background: transparent;
      padding: 0 0.2rem;
    }

    .queue-table__row.is-selected {
      border-color: var(--app-primary);
      box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.22);
    }

    .queue-table__row.is-disabled {
      opacity: 0.72;
    }

    .queue-table__row button {
      border: 0;
      border-radius: 999px;
      padding: 0.4rem 0.75rem;
      background: var(--app-primary);
      color: #111827;
      font-weight: 700;
      cursor: pointer;
    }

    .is-critical {
      color: var(--app-danger);
      font-weight: 700;
    }

    @media (max-width: 1200px) {
      .queue-table {
        overflow-x: auto;
      }

      .queue-table__row {
        min-width: 1100px;
      }
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
  readonly aiStatuses = input<Record<string, string>>({});
  readonly affectedDeviceCounts = input<Record<string, number>>({});
  readonly disabled = input(false);
  readonly incidentSelected = output<IncidentSummary>();
}
