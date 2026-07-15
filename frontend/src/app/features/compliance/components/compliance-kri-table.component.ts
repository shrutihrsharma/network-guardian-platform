import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ComplianceKriTableRow } from '../../../core/models/compliance.model';

@Component({
  selector: 'app-compliance-kri-table',
  standalone: true,
  imports: [DecimalPipe, MatTableModule, MatIconModule, MatButtonModule],
  template: `
    <div class="table-wrap">
      <table mat-table [dataSource]="rows()" class="kri-table">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let row">
            <div class="primary">{{ row.name }}</div>
            <div class="sub">{{ row.description }}</div>
          </td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let row">{{ row.category }}</td>
        </ng-container>

        <ng-container matColumnDef="severity">
          <th mat-header-cell *matHeaderCellDef>Severity</th>
          <td mat-cell *matCellDef="let row">
            <span class="severity-chip" [class]="'sev-' + row.severity.toLowerCase()">{{ row.severity }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="threshold">
          <th mat-header-cell *matHeaderCellDef>Threshold</th>
          <td mat-cell *matCellDef="let row">{{ row.threshold | number:'1.0-2' }}</td>
        </ng-container>

        <ng-container matColumnDef="currentValue">
          <th mat-header-cell *matHeaderCellDef>Current Value</th>
          <td mat-cell *matCellDef="let row">{{ row.currentValue | number:'1.0-1' }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let row">
            <span class="status-chip" [class.pass]="row.status === 'Passing'" [class.fail]="row.status === 'Failing'">
              {{ row.status }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="aiGenerated">
          <th mat-header-cell *matHeaderCellDef>AI Generated</th>
          <td mat-cell *matCellDef="let row">{{ row.aiGenerated ? 'Yes' : 'No' }}</td>
        </ng-container>

        <ng-container matColumnDef="approved">
          <th mat-header-cell *matHeaderCellDef>Approved</th>
          <td mat-cell *matCellDef="let row">{{ row.approved ? 'Yes' : 'No' }}</td>
        </ng-container>

        @if (showReviewActions()) {
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <div class="actions">
                <button mat-stroked-button color="primary" (click)="approve.emit(row.id)" [disabled]="row.approved && row.enabled">
                  Approve
                </button>
                <button mat-stroked-button class="reject-btn" (click)="reject.emit(row.id)" [disabled]="row.approved && !row.enabled">
                  Reject
                </button>
              </div>
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      </table>

      @if (!rows().length) {
        <div class="empty">
          <mat-icon>task_alt</mat-icon>
          <p>No KRIs found for the current filter state.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .table-wrap {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      overflow: auto;
    }

    .kri-table {
      width: 100%;
      min-width: 900px;
      background: transparent;
    }

    .primary {
      font-size: 0.82rem;
      color: var(--app-text);
      font-weight: 600;
    }

    .sub {
      margin-top: 0.12rem;
      font-size: 0.72rem;
      color: var(--app-text-muted);
      line-height: 1.35;
      max-width: 20rem;
    }

    .severity-chip,
    .status-chip {
      display: inline-flex;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 700;
      border: 1px solid transparent;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .sev-critical { background: var(--app-danger-soft); color: var(--app-danger); border-color: rgba(239,68,68,0.3); }
    .sev-high { background: var(--app-warning-soft); color: var(--app-warning); border-color: rgba(249,115,22,0.3); }
    .sev-medium { background: rgba(234,179,8,0.12); color: #eab308; border-color: rgba(234,179,8,0.3); }
    .sev-low { background: var(--app-success-soft); color: var(--app-success); border-color: rgba(34,197,94,0.3); }

    .status-chip.pass { background: var(--app-success-soft); color: var(--app-success); border-color: rgba(34,197,94,0.3); }
    .status-chip.fail { background: var(--app-danger-soft); color: var(--app-danger); border-color: rgba(239,68,68,0.3); }

    .actions {
      display: flex;
      gap: 0.4rem;
      align-items: center;
    }

    .reject-btn {
      border-color: rgba(239,68,68,0.35) !important;
      color: var(--app-danger) !important;
    }

    .empty {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      justify-content: center;
      padding: 1.2rem;
      color: var(--app-text-muted);
      font-size: 0.82rem;
    }

    .empty mat-icon {
      width: 1rem;
      height: 1rem;
      font-size: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceKriTableComponent {
  readonly rows = input.required<ComplianceKriTableRow[]>();
  readonly showReviewActions = input(false);

  readonly approve = output<string>();
  readonly reject = output<string>();

  readonly displayedColumns = input<string[]>([
    'name',
    'category',
    'severity',
    'threshold',
    'currentValue',
    'status',
    'aiGenerated',
    'approved',
  ]);
}
