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
      <div class="table-scroll">
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
              <div class="cell-primary device-name">{{ row.deviceName }}</div>
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
              <div class="cell-primary finding-title">{{ row.title }}</div>
              <div class="cell-sub truncate">{{ row.description }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="complianceImpact">
            <th mat-header-cell *matHeaderCellDef>Compliance Impact</th>
            <td mat-cell *matCellDef="let row">
              <span class="tag tag--compliance">{{ row.complianceImpact }}</span>
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

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: columns"
            class="data-row"
            [class.selected]="selectedFinding()?.id === row.id"
            (click)="findingSelected.emit(row)"
          ></tr>
        </table>
      </div>

      @if (totalFindings() > 0) {
        <div class="table-footer">
          <div class="footer-meta">Showing {{ rangeStart() }}–{{ rangeEnd() }} of {{ totalFindings() }} findings</div>

          <div class="footer-controls">
            <label class="rows-per-page" for="rowsPerPageSelect">
              Rows per page
              <select
                id="rowsPerPageSelect"
                [value]="pageSize()"
                (change)="onPageSizeChanged($event)"
              >
                <option [value]="10">10</option>
                <option [value]="20">20</option>
                <option [value]="50">50</option>
              </select>
            </label>

            <button
              type="button"
              class="pager-btn"
              [disabled]="currentPage() === 1"
              (click)="pageChanged.emit(currentPage() - 1)"
            >
              Previous
            </button>

            <div class="page-list" aria-label="Pagination pages">
              @for (page of pageNumbers(); track page) {
                <button
                  type="button"
                  class="pager-btn pager-btn--page"
                  [class.is-active]="page === currentPage()"
                  (click)="pageChanged.emit(page)"
                >
                  {{ page }}
                </button>
              }
            </div>

            <button
              type="button"
              class="pager-btn"
              [disabled]="currentPage() === pageNumbers().length"
              (click)="pageChanged.emit(currentPage() + 1)"
            >
              Next
            </button>
          </div>
        </div>
      }

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
      height: 100%;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .table-scroll {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }

    .table-scroll::-webkit-scrollbar {
      width: 0.5rem;
    }

    .table-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .table-scroll::-webkit-scrollbar-thumb {
      background: var(--app-border);
      border-radius: 0.25rem;
    }

    .findings-table {
      width: 100%;
      background: transparent;
      table-layout: fixed;
    }

    .mat-mdc-header-row {
      background: var(--app-surface-strong);
      z-index: 2;
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
      padding: 0.4rem 0.65rem !important;
      vertical-align: middle;
    }

    .mat-mdc-row {
      height: 4.2rem;
    }

    .mat-column-severity {
      width: 6.6rem;
    }

    .mat-column-device {
      width: 12rem;
    }

    .mat-column-category {
      width: 10.5rem;
    }

    .mat-column-finding {
      width: 30%;
    }

    .mat-column-complianceImpact {
      width: 8.8rem;
    }

    .mat-column-status {
      width: 7.2rem;
    }

    .mat-column-action {
      width: 7rem;
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

    .data-row.selected .mat-mdc-cell:first-child {
      position: relative;
    }

    .data-row.selected .mat-mdc-cell:first-child::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: rgba(245, 158, 11, 0.85);
    }

    .cell-primary {
      font-size: 0.83rem;
      font-weight: 600;
      color: var(--app-text);
      line-height: 1.25;
    }

    .device-name,
    .finding-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cell-sub {
      margin-top: 0.12rem;
      font-size: 0.72rem;
      color: var(--app-text-muted);
      line-height: 1.3;
    }

    .truncate {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tag {
      display: inline-block;
      padding: 0.16rem 0.44rem;
      border-radius: 0.35rem;
      font-size: 0.68rem;
      font-weight: 600;
      border: 1px solid var(--app-border);
      background: var(--app-surface-strong);
      color: var(--app-text-secondary);
      white-space: nowrap;
    }

    .tag--compliance {
      padding: 0.14rem 0.36rem;
      font-size: 0.66rem;
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
      padding: 0.18rem 0.45rem;
      font-size: 0.72rem;
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
      padding: 2rem;
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

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      border-top: 1px solid var(--app-border);
      padding: 0.55rem 0.7rem;
      background: var(--app-surface);
      flex-wrap: wrap;
    }

    .footer-meta {
      color: var(--app-text-muted);
      font-size: 0.75rem;
      white-space: nowrap;
    }

    .footer-controls {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .rows-per-page {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--app-text-muted);
      font-size: 0.74rem;
      white-space: nowrap;
    }

    .rows-per-page select {
      border: 1px solid var(--app-border);
      background: var(--app-card-bg);
      color: var(--app-text);
      border-radius: 0.35rem;
      padding: 0.12rem 0.32rem;
      font-size: 0.74rem;
    }

    .pager-btn {
      border: 1px solid var(--app-border);
      background: transparent;
      color: var(--app-text-secondary);
      border-radius: 0.38rem;
      min-height: 1.8rem;
      padding: 0.18rem 0.5rem;
      font-size: 0.72rem;
      cursor: pointer;
    }

    .pager-btn:hover:not(:disabled) {
      color: var(--app-text);
      background: rgba(255, 255, 255, 0.03);
    }

    .pager-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .page-list {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .pager-btn--page {
      min-width: 1.9rem;
      justify-content: center;
      padding: 0.18rem 0.35rem;
    }

    .pager-btn--page.is-active {
      border-color: rgba(245, 158, 11, 0.5);
      background: rgba(245, 158, 11, 0.12);
      color: var(--app-text);
    }

    @media (max-width: 1280px) {
      .mat-column-action {
        width: 6rem;
      }

      .row-action {
        padding: 0.16rem 0.35rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityFindingsTableComponent {
  readonly findings = input.required<SecurityFinding[]>();
  readonly selectedFinding = input<SecurityFinding | null>(null);
  readonly currentPage = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalFindings = input.required<number>();
  readonly pageNumbers = input.required<number[]>();
  readonly rangeStart = input.required<number>();
  readonly rangeEnd = input.required<number>();

  readonly findingSelected = output<SecurityFinding>();
  readonly pageChanged = output<number>();
  readonly pageSizeChanged = output<number>();

  readonly columns = ['severity', 'device', 'category', 'finding', 'complianceImpact', 'status', 'action'];

  onReview(finding: SecurityFinding, event: Event): void {
    event.stopPropagation();
    this.findingSelected.emit(finding);
  }

  onPageSizeChanged(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const size = Number.parseInt(target.value, 10);
    this.pageSizeChanged.emit(size);
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
