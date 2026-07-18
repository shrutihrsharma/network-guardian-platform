import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DeviceInventoryItem } from '../../../core/models/device.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';

@Component({
  selector: 'app-device-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, StatusChipComponent, EmptyStateComponent],
  template: `
    <section class="device-table-shell">
      @if (isLoading()) {
        <div class="table-wrapper">
          <table mat-table [dataSource]="skeletonRows" class="device-table">
            <ng-container matColumnDef="navigation">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let _row"><span class="table-chevron">&#8250;</span></td>
            </ng-container>

            <ng-container matColumnDef="hostname">
              <th mat-header-cell *matHeaderCellDef>Hostname</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-hostname"></span></td>
            </ng-container>

            <ng-container matColumnDef="vendor">
              <th mat-header-cell *matHeaderCellDef>Vendor</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-short"></span></td>
            </ng-container>

            <ng-container matColumnDef="deviceType">
              <th mat-header-cell *matHeaderCellDef>Device Type</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-short"></span></td>
            </ng-container>

            <ng-container matColumnDef="region">
              <th mat-header-cell *matHeaderCellDef>Region</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-mini"></span></td>
            </ng-container>

            <ng-container matColumnDef="healthStatus">
              <th mat-header-cell *matHeaderCellDef>Health</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-short"></span></td>
            </ng-container>

            <ng-container matColumnDef="lifecycleStatus">
              <th mat-header-cell *matHeaderCellDef>Lifecycle</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-short"></span></td>
            </ng-container>

            <ng-container matColumnDef="complianceStatus">
              <th mat-header-cell *matHeaderCellDef>Compliance</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-short"></span></td>
            </ng-container>

            <ng-container matColumnDef="openIncidents">
              <th mat-header-cell *matHeaderCellDef>Open Incidents</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-mini"></span></td>
            </ng-container>

            <ng-container matColumnDef="riskScore">
              <th mat-header-cell *matHeaderCellDef>Risk Score</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-mini"></span></td>
            </ng-container>

            <ng-container matColumnDef="lastUpdated">
              <th mat-header-cell *matHeaderCellDef>Last Updated</th>
              <td mat-cell *matCellDef="let _row"><span class="skeleton-block w-short"></span></td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
      } @else if (devices().length === 0) {
        <app-empty-state
          title="No devices match the selected filters."
          description="Adjust search criteria or reset filters to restore inventory results."
          icon="dns"
        />
      } @else {
        <div class="table-wrapper">
          <table mat-table [dataSource]="pagedDevices()" class="device-table">
            <ng-container matColumnDef="navigation">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <span class="table-chevron" aria-hidden="true">&#8250;</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="hostname">
              <th mat-header-cell *matHeaderCellDef>Hostname</th>
              <td mat-cell *matCellDef="let row">{{ row.hostname }}</td>
            </ng-container>

            <ng-container matColumnDef="vendor">
              <th mat-header-cell *matHeaderCellDef>Vendor</th>
              <td mat-cell *matCellDef="let row">{{ row.vendor }}</td>
            </ng-container>

            <ng-container matColumnDef="deviceType">
              <th mat-header-cell *matHeaderCellDef>Device Type</th>
              <td mat-cell *matCellDef="let row">{{ row.deviceType }}</td>
            </ng-container>

            <ng-container matColumnDef="region">
              <th mat-header-cell *matHeaderCellDef>Region</th>
              <td mat-cell *matCellDef="let row">{{ row.region }}</td>
            </ng-container>

            <ng-container matColumnDef="healthStatus">
              <th mat-header-cell *matHeaderCellDef>Health</th>
              <td mat-cell *matCellDef="let row">
                <span class="health-cell" [attr.data-health]="healthTone(row.healthStatus)">
                  <span class="health-dot" aria-hidden="true"></span>
                  {{ healthLabel(row.healthStatus) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="lifecycleStatus">
              <th mat-header-cell *matHeaderCellDef>Lifecycle</th>
              <td mat-cell *matCellDef="let row">
                <app-status-chip [status]="row.lifecycleStatus" />
              </td>
            </ng-container>

            <ng-container matColumnDef="complianceStatus">
              <th mat-header-cell *matHeaderCellDef>Compliance</th>
              <td mat-cell *matCellDef="let row">
                <app-status-chip [status]="row.complianceStatus" />
              </td>
            </ng-container>

            <ng-container matColumnDef="openIncidents">
              <th mat-header-cell *matHeaderCellDef>Open Incidents</th>
              <td mat-cell *matCellDef="let row">{{ openIncidents(row) }}</td>
            </ng-container>

            <ng-container matColumnDef="riskScore">
              <th mat-header-cell *matHeaderCellDef>Risk Score</th>
              <td mat-cell *matCellDef="let row">
                <span class="risk-score">{{ riskScore(row) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="lastUpdated">
              <th mat-header-cell *matHeaderCellDef>Last Updated</th>
              <td mat-cell *matCellDef="let row">{{ lastUpdated(row) }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              class="device-row"
              (click)="openDetails.emit(row)"
            ></tr>
          </table>
        </div>

        <mat-paginator
          [length]="devices().length"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="pageSizeOptions()"
          (page)="onPageChanged($event)"
        />
      }
    </section>
  `,
  styles: `
    .device-table-shell {
      border: 1px solid var(--app-border);
      border-radius: 0.75rem;
      background: var(--app-surface);
      overflow: hidden;
    }

    .table-wrapper {
      width: 100%;
      overflow: auto;
    }

    .device-table {
      min-width: 1120px;
      width: 100%;
      background: transparent;
    }

    .mat-mdc-header-cell {
      color: var(--app-text-muted);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--app-border);
      white-space: nowrap;
      padding-top: 0.65rem;
      padding-bottom: 0.65rem;
    }

    .mat-mdc-cell {
      color: var(--app-text);
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      white-space: nowrap;
      padding-top: 0.55rem;
      padding-bottom: 0.55rem;
      font-size: 0.84rem;
    }

    .table-chevron {
      color: var(--app-text-muted);
      font-size: 1.05rem;
      font-weight: 700;
    }

    .health-cell {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
    }

    .health-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: #94a3b8;
    }

    .health-cell[data-health='healthy'] .health-dot {
      background: var(--app-success);
    }

    .health-cell[data-health='warning'] .health-dot {
      background: var(--app-warning);
    }

    .health-cell[data-health='critical'] .health-dot {
      background: #ef4444;
    }

    .risk-score {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.7rem;
      height: 1.5rem;
      border-radius: 999px;
      border: 1px solid rgba(245, 158, 11, 0.36);
      color: #f59e0b;
      font-weight: 700;
      font-size: 0.77rem;
    }

    .device-row {
      cursor: pointer;
      transition: background-color 120ms ease;
    }

    .device-row .mat-mdc-cell:first-child {
      border-left: 2px solid transparent;
      transition: border-color 120ms ease;
    }

    .device-row:hover .mat-mdc-cell {
      background: rgba(148, 163, 184, 0.12);
    }

    .device-row:hover .mat-mdc-cell:first-child {
      border-left-color: rgba(245, 158, 11, 0.75);
    }

    .skeleton-block {
      display: inline-block;
      height: 0.72rem;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(148, 163, 184, 0.14) 0%, rgba(148, 163, 184, 0.22) 50%, rgba(148, 163, 184, 0.14) 100%);
      background-size: 220% 100%;
      animation: loading-shimmer 1.1s ease-in-out infinite;
    }

    .w-hostname {
      width: 7rem;
    }

    .w-short {
      width: 4.8rem;
    }

    .w-mini {
      width: 2rem;
    }

    @keyframes loading-shimmer {
      0% {
        background-position: 100% 0;
      }
      100% {
        background-position: -100% 0;
      }
    }

    mat-paginator {
      border-top: 1px solid var(--app-border);
      background: transparent;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceTableComponent {
  readonly devices = input.required<DeviceInventoryItem[]>();
  readonly pageSizeOptions = input<number[]>([10, 20, 50]);
  readonly isLoading = input(false);

  readonly openDetails = output<DeviceInventoryItem>();

  protected readonly displayedColumns = [
    'navigation',
    'hostname',
    'vendor',
    'deviceType',
    'region',
    'healthStatus',
    'lifecycleStatus',
    'complianceStatus',
    'openIncidents',
    'riskScore',
    'lastUpdated'
  ];

  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly skeletonRows = Array.from({ length: 8 }, (_, index) => index);

  protected readonly pagedDevices = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.devices().slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      this.devices();
      this.pageIndex.set(0);
    });
  }

  protected onPageChanged(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected healthTone(healthStatus: string): 'healthy' | 'warning' | 'critical' {
    const normalized = healthStatus.toLowerCase();

    if (normalized === 'healthy') {
      return 'healthy';
    }

    if (normalized === 'warning' || normalized === 'watch' || normalized === 'monitoring') {
      return 'warning';
    }

    return 'critical';
  }

  protected healthLabel(healthStatus: string): string {
    const tone = this.healthTone(healthStatus);
    if (tone === 'warning') {
      return 'Warning';
    }
    if (tone === 'critical') {
      return 'Critical';
    }
    return 'Healthy';
  }

  protected openIncidents(device: DeviceInventoryItem): number {
    if (this.healthTone(device.healthStatus) === 'critical') {
      return 3;
    }

    if (this.healthTone(device.healthStatus) === 'warning' || device.complianceStatus.toLowerCase() !== 'compliant') {
      return 1;
    }

    return 0;
  }

  protected riskScore(device: DeviceInventoryItem): number {
    let score = 20;
    const risk = device.predictiveRisk.toLowerCase();

    if (risk === 'high') {
      score += 45;
    } else if (risk === 'medium') {
      score += 25;
    } else {
      score += 10;
    }

    if (this.healthTone(device.healthStatus) === 'critical') {
      score += 20;
    } else if (this.healthTone(device.healthStatus) === 'warning') {
      score += 10;
    }

    if (device.complianceStatus.toLowerCase() !== 'compliant') {
      score += 12;
    }

    return Math.min(score, 99);
  }

  protected lastUpdated(device: DeviceInventoryItem): string {
    const code = device.id
      .split('')
      .reduce((total, char) => total + char.charCodeAt(0), 0);
    const minutes = (code % 14) + 2;
    return `${minutes}m ago`;
  }
}
