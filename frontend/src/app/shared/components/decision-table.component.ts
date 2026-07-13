import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

interface RecentDecisionRow {
  id: string;
  engine: string;
  confidence: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  timestamp: string;
}

@Component({
  selector: 'app-decision-table',
  standalone: true,
  imports: [MatTableModule, MatChipsModule],
  template: `
    <div class="table-card">
      <table mat-table [dataSource]="rows" class="decision-table">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>Decision ID</th>
          <td mat-cell *matCellDef="let row">{{ row.id }}</td>
        </ng-container>

        <ng-container matColumnDef="engine">
          <th mat-header-cell *matHeaderCellDef>Decision Engine</th>
          <td mat-cell *matCellDef="let row">{{ row.engine }}</td>
        </ng-container>

        <ng-container matColumnDef="confidence">
          <th mat-header-cell *matHeaderCellDef>Confidence</th>
          <td mat-cell *matCellDef="let row">{{ row.confidence }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let row">
            <mat-chip [class]="row.status.toLowerCase()">{{ row.status }}</mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="timestamp">
          <th mat-header-cell *matHeaderCellDef>Timestamp</th>
          <td mat-cell *matCellDef="let row">{{ row.timestamp }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
  styles: `
    .table-card {
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      overflow: hidden;
      background: var(--app-surface);
    }

    .decision-table {
      width: 100%;
      background: transparent;
    }

    .mat-mdc-header-cell,
    .mat-mdc-cell {
      color: var(--app-text);
      border-bottom-color: var(--app-border);
    }

    .mat-mdc-header-cell {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--app-text-muted);
    }

    mat-chip {
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid transparent;
    }

    mat-chip.success {
      background: rgba(34, 197, 94, 0.16);
      color: var(--app-success);
      border-color: rgba(34, 197, 94, 0.28);
    }

    mat-chip.warning {
      background: rgba(245, 158, 11, 0.16);
      color: var(--app-warning);
      border-color: rgba(245, 158, 11, 0.28);
    }

    mat-chip.failed {
      background: rgba(239, 68, 68, 0.16);
      color: var(--app-danger);
      border-color: rgba(239, 68, 68, 0.28);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecisionTableComponent {
  readonly displayedColumns = ['id', 'engine', 'confidence', 'status', 'timestamp'];
  readonly rows: RecentDecisionRow[] = [
    { id: 'DEC-1042', engine: 'Incident', confidence: '98%', status: 'SUCCESS', timestamp: '08:42 UTC' },
    { id: 'DEC-1041', engine: 'Capacity', confidence: '92%', status: 'WARNING', timestamp: '07:18 UTC' },
    { id: 'DEC-1040', engine: 'Security', confidence: '95%', status: 'SUCCESS', timestamp: '06:05 UTC' },
    { id: 'DEC-1039', engine: 'Deployment', confidence: '88%', status: 'FAILED', timestamp: '05:22 UTC' },
    { id: 'DEC-1038', engine: 'Incident', confidence: '97%', status: 'SUCCESS', timestamp: '04:34 UTC' }
  ];
}
