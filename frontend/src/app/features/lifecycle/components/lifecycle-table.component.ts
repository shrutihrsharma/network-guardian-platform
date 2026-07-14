import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DeviceLifecycleSummary, STAGE_CONFIG, LifecycleStage } from '../../../core/models/lifecycle.model';

@Component({
  selector: 'app-lifecycle-table',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatButtonModule],
  template: `
    <div class="table-wrap">
      <table mat-table [dataSource]="devices()" class="lc-table">

        <ng-container matColumnDef="hostname">
          <th mat-header-cell *matHeaderCellDef>Device</th>
          <td mat-cell *matCellDef="let row">
            <div class="cell-primary">{{ row.hostname }}</div>
            <div class="cell-sub">{{ row.vendor }} · {{ row.model }}</div>
          </td>
        </ng-container>

        <ng-container matColumnDef="region">
          <th mat-header-cell *matHeaderCellDef>Region</th>
          <td mat-cell *matCellDef="let row">
            <span class="tag">{{ row.region }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="osVersion">
          <th mat-header-cell *matHeaderCellDef>Current OS</th>
          <td mat-cell *matCellDef="let row">
            <span class="mono">{{ row.osVersion }}</span>
            @if (row.osVersion !== row.recommendedVersion) {
              <div class="rec-version">→ {{ row.recommendedVersion }}</div>
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="lifecycleStage">
          <th mat-header-cell *matHeaderCellDef>Stage</th>
          <td mat-cell *matCellDef="let row">
            <span class="stage-chip"
              [style.color]="stageConf(row.lifecycleStage).color"
              [style.background]="stageConf(row.lifecycleStage).bg"
            >
              <mat-icon>{{ stageConf(row.lifecycleStage).icon }}</mat-icon>
              {{ row.lifecycleStage }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="daysUntilUnsupported">
          <th mat-header-cell *matHeaderCellDef>Days to EOL</th>
          <td mat-cell *matCellDef="let row">
            <span [class]="daysClass(row.daysUntilUnsupported)">
              {{ row.daysUntilUnsupported < 0 ? 'Past EOL' : row.daysUntilUnsupported + ' days' }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="criticality">
          <th mat-header-cell *matHeaderCellDef>Criticality</th>
          <td mat-cell *matCellDef="let row">
            <span class="tag" [class.tier1]="row.criticality === 'Tier 1'">{{ row.criticality }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button class="action-btn" (click)="deviceSelected.emit(row)" title="Analyse lifecycle">
              <mat-icon>psychology</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"
          class="data-row"
          [class.selected]="selectedDevice()?.deviceId === row.deviceId"
          (click)="deviceSelected.emit(row)">
        </tr>
      </table>

      @if (!devices().length) {
        <div class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>No devices match the current filters.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .table-wrap {
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      overflow: hidden;
      background: var(--app-card-bg);
    }

    .lc-table {
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
    }

    .mat-mdc-cell {
      border-bottom-color: var(--app-border) !important;
      padding: 0.65rem 0.75rem !important;
    }

    .data-row {
      cursor: pointer;
      transition: background 0.12s;
    }

    .data-row:hover {
      background: var(--app-surface-strong) !important;
    }

    .data-row.selected {
      background: var(--app-primary-soft) !important;
    }

    .cell-primary {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--app-text);
    }

    .cell-sub {
      font-size: 0.72rem;
      color: var(--app-text-muted);
      margin-top: 0.1rem;
    }

    .tag {
      display: inline-block;
      padding: 0.18rem 0.5rem;
      border-radius: 0.35rem;
      font-size: 0.7rem;
      font-weight: 600;
      background: var(--app-surface-strong);
      border: 1px solid var(--app-border);
      color: var(--app-text-secondary);
    }

    .tag.tier1 {
      background: var(--app-danger-soft);
      color: var(--app-danger);
      border-color: rgba(239,68,68,0.25);
    }

    .mono {
      font-family: monospace;
      font-size: 0.8rem;
      color: var(--app-accent);
    }

    .rec-version {
      font-size: 0.7rem;
      color: var(--app-success);
      margin-top: 0.15rem;
      font-family: monospace;
    }

    .stage-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.55rem 0.2rem 0.3rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .stage-chip mat-icon {
      font-size: 0.85rem;
      width: 0.85rem;
      height: 0.85rem;
    }

    .days-critical { color: var(--app-danger);  font-weight: 700; }
    .days-warning  { color: var(--app-warning); font-weight: 600; }
    .days-ok       { color: var(--app-text-secondary); }

    .action-btn {
      color: var(--app-primary);
      width: 2rem;
      height: 2rem;
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
export class LifecycleTableComponent {
  readonly devices = input.required<DeviceLifecycleSummary[]>();
  readonly selectedDevice = input<DeviceLifecycleSummary | null>(null);
  readonly deviceSelected = output<DeviceLifecycleSummary>();

  readonly columns = ['hostname', 'region', 'osVersion', 'lifecycleStage', 'daysUntilUnsupported', 'criticality', 'actions'];

  stageConf(stage: string) {
    return STAGE_CONFIG[stage as LifecycleStage] ?? STAGE_CONFIG['Maintain'];
  }

  daysClass(days: number): string {
    if (days < 0 || days <= 90) return 'days-critical';
    if (days <= 365) return 'days-warning';
    return 'days-ok';
  }
}
