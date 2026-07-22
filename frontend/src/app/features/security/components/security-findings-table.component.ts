import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { SecurityFinding } from '../../../core/models/security-finding.model';

@Component({
  selector: 'app-security-findings-table',
  standalone: true,
  imports: [MatTableModule, MatIconModule],
  template: `
    <div class="table-wrap">
      <table mat-table [dataSource]="findings()" class="findings-table">
        <ng-container matColumnDef="severity">
          <th mat-header-cell *matHeaderCellDef>Severity</th>
          <td mat-cell *matCellDef="let row">
            <span class="severity-chip" [class]="severityClass(row.severity)">
              {{ row.severity }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="device">
          <th mat-header-cell *matHeaderCellDef>Device</th>
          <td mat-cell *matCellDef="let row">
            <div class="cell-primary">{{ row.deviceName }}</div>
            <div class="cell-sub">{{ row.vendor }} · {{ row.region }}</div>
          </td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let row">
            <span class="tag">{{ prettyCategory(row.category) }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="finding">
          <th mat-header-cell *matHeaderCellDef>Finding</th>
          <td mat-cell *matCellDef="let row">
            <div class="cell-primary">{{ row.title }}</div>
            <div class="cell-sub truncate">{{ row.description }}</div>
          </td>
        </ng-container>

        <ng-container matColumnDef="complianceImpact">
          <th mat-header-cell *matHeaderCellDef>Compliance Impact</th>
          <td mat-cell *matCellDef="let row">
            <span class="tag">{{ row.complianceImpact }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let row">
            <span class="status-chip" [class]="statusClass(row.status)">{{ row.status }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Action</th>
          <td mat-cell *matCellDef="let row">
            <button class="row-action" type="button" (click)="onReview(row, $event)">
              <mat-icon>insights</mat-icon>
              Review
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: columns"
          class="data-row"
          [class.selected]="selectedFinding()?.id === row.id"
          (click)="findingSelected.emit(row)"
        ></tr>
      </table>

      @if (!findings().length) {
        <div class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>No security findings match the current filters.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .table-wrap {
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius);
      background: var(--app-card-bg);
      max-height: 44rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .table-wrap::-webkit-scrollbar {
      width: 0.5rem;
    }

    .table-wrap::-webkit-scrollbar-track {
      background: transparent;
    }

    .table-wrap::-webkit-scrollbar-thumb {
      background: var(--app-border);
      border-radius: 0.25rem;
    }

    .findings-table {
      width: 100%;
      background: transparent;
    }

    .mat-mdc-header-cell {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--app-text-muted) !important;
      border-bottom-color: var(--app-border) !important;
      white-space: nowrap;
    }

    .mat-mdc-cell {
      border-bottom-color: var(--app-border) !important;
      padding: 0.55rem 0.75rem !important;
      vertical-align: top;
    }

    .data-row {
      cursor: pointer;
      transition: background 0.12s;
    }

    .data-row:hover {
      background: var(--app-surface-strong) !important;
    }

    .data-row.selected {
      background: rgba(245, 158, 11, 0.08) !important;
      box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.28);
    }

    .cell-primary {
      font-size: 0.83rem;
      font-weight: 600;
      color: var(--app-text);
      line-height: 1.35;
    }

    .cell-sub {
      margin-top: 0.15rem;
      font-size: 0.72rem;
      color: var(--app-text-muted);
      line-height: 1.4;
    }

    .truncate {
      max-width: 22rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tag {
      display: inline-block;
      padding: 0.18rem 0.5rem;
      border-radius: 0.35rem;
      font-size: 0.7rem;
      font-weight: 600;
      border: 1px solid var(--app-border);
      background: var(--app-surface-strong);
      color: var(--app-text-secondary);
      white-space: nowrap;
    }

    .severity-chip,
    .status-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 0.2rem 0.58rem;
      font-size: 0.69rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .sev-critical {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .sev-high {
      color: #fdba74;
      background: rgba(249, 115, 22, 0.12);
      border-color: rgba(249, 115, 22, 0.3);
    }

    .sev-medium {
      color: #fde68a;
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .sev-low {
      color: #93c5fd;
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.3);
    }

    .st-open {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.28);
    }

    .st-mitigated {
      color: #86efac;
      background: rgba(34, 197, 94, 0.12);
      border-color: rgba(34, 197, 94, 0.28);
    }

    .st-accepted {
      color: #cbd5e1;
      background: rgba(100, 116, 139, 0.18);
      border-color: rgba(148, 163, 184, 0.3);
    }

    .row-action {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: 1px solid var(--app-border);
      background: transparent;
      color: var(--app-text-secondary);
      border-radius: 0.45rem;
      padding: 0.2rem 0.5rem;
      font-size: 0.74rem;
      cursor: pointer;
    }

    .row-action mat-icon {
      width: 0.9rem;
      height: 0.9rem;
      font-size: 0.9rem;
    }

    .row-action:hover {
      color: var(--app-text);
      border-color: var(--app-text-muted);
      background: rgba(255, 255, 255, 0.02);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2.5rem;
      color: var(--app-text-muted);
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      opacity: 0.4;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.88rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityFindingsTableComponent {
  readonly findings = input.required<SecurityFinding[]>();
  readonly selectedFinding = input<SecurityFinding | null>(null);
  readonly findingSelected = output<SecurityFinding>();

  readonly columns = ['severity', 'device', 'category', 'finding', 'complianceImpact', 'status', 'action'];

  onReview(finding: SecurityFinding, event: Event): void {
    event.stopPropagation();
    this.findingSelected.emit(finding);
  }

  prettyCategory(category: string): string {
    return category.replaceAll('_', ' ');
  }

  severityClass(severity: SecurityFinding['severity']): string {
    return `sev-${severity.toLowerCase()}`;
  }

  statusClass(status: SecurityFinding['status']): string {
    return `st-${status.toLowerCase()}`;
  }
}
