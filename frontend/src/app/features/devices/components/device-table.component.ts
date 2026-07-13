import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DeviceInventoryItem } from '../../../core/models/device.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';

@Component({
  selector: 'app-device-table',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, MatPaginatorModule, StatusChipComponent, EmptyStateComponent],
  template: `
    <section class="device-table-shell">
      @if (devices().length === 0) {
        <app-empty-state
          title="No devices match the selected filters"
          description="Adjust search criteria or reset filters to restore inventory results."
          icon="dns"
        />
      } @else {
        <div class="table-wrapper">
          <table mat-table [dataSource]="pagedDevices()" class="device-table">
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox
                  [checked]="isAllPageSelected()"
                  [indeterminate]="selection.hasValue() && !isAllPageSelected()"
                  (change)="toggleSelectAllOnPage()"
                  aria-label="Select all devices on current page"
                />
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox
                  [checked]="selection.isSelected(row)"
                  (click)="$event.stopPropagation()"
                  (change)="toggleRow(row)"
                  aria-label="Select device"
                />
              </td>
            </ng-container>

            <ng-container matColumnDef="deviceName">
              <th mat-header-cell *matHeaderCellDef>Device Name</th>
              <td mat-cell *matCellDef="let row">{{ row.deviceName }}</td>
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

            <ng-container matColumnDef="model">
              <th mat-header-cell *matHeaderCellDef>Model</th>
              <td mat-cell *matCellDef="let row">{{ row.model }}</td>
            </ng-container>

            <ng-container matColumnDef="region">
              <th mat-header-cell *matHeaderCellDef>Region</th>
              <td mat-cell *matCellDef="let row">{{ row.region }}</td>
            </ng-container>

            <ng-container matColumnDef="businessService">
              <th mat-header-cell *matHeaderCellDef>Business Service</th>
              <td mat-cell *matCellDef="let row">{{ row.businessService }}</td>
            </ng-container>

            <ng-container matColumnDef="lifecycleStatus">
              <th mat-header-cell *matHeaderCellDef>Lifecycle Status</th>
              <td mat-cell *matCellDef="let row">
                <app-status-chip [status]="row.lifecycleStatus" />
              </td>
            </ng-container>

            <ng-container matColumnDef="complianceStatus">
              <th mat-header-cell *matHeaderCellDef>Compliance Status</th>
              <td mat-cell *matCellDef="let row">
                <app-status-chip [status]="row.complianceStatus" />
              </td>
            </ng-container>

            <ng-container matColumnDef="predictiveRisk">
              <th mat-header-cell *matHeaderCellDef>Predictive Risk</th>
              <td mat-cell *matCellDef="let row">
                <app-status-chip [status]="row.predictiveRisk" />
              </td>
            </ng-container>

            <ng-container matColumnDef="healthStatus">
              <th mat-header-cell *matHeaderCellDef>Health Status</th>
              <td mat-cell *matCellDef="let row">
                <app-status-chip [status]="row.healthStatus" />
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns" (click)="openDetails.emit(row)"></tr>
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
      border-radius: 1rem;
      background: var(--app-surface);
      overflow: hidden;
    }

    .table-wrapper {
      width: 100%;
      overflow: auto;
    }

    .device-table {
      min-width: 1280px;
      width: 100%;
      background: transparent;
    }

    .mat-mdc-header-cell {
      color: var(--app-text-muted);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--app-border);
      white-space: nowrap;
    }

    .mat-mdc-cell {
      color: var(--app-text);
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      white-space: nowrap;
      cursor: pointer;
    }

    .mat-mdc-row:hover .mat-mdc-cell {
      background: rgba(59, 130, 246, 0.08);
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

  readonly openDetails = output<DeviceInventoryItem>();
  readonly selectionChanged = output<DeviceInventoryItem[]>();

  protected readonly displayedColumns = [
    'select',
    'deviceName',
    'hostname',
    'vendor',
    'deviceType',
    'model',
    'region',
    'businessService',
    'lifecycleStatus',
    'complianceStatus',
    'predictiveRisk',
    'healthStatus'
  ];

  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly selection = new SelectionModel<DeviceInventoryItem>(true, []);

  protected readonly pagedDevices = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.devices().slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      this.devices();
      this.pageIndex.set(0);
      this.selection.clear();
      this.selectionChanged.emit([]);
    });
  }

  protected onPageChanged(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected toggleRow(row: DeviceInventoryItem): void {
    this.selection.toggle(row);
    this.selectionChanged.emit(this.selection.selected);
  }

  protected toggleSelectAllOnPage(): void {
    const pageRows = this.pagedDevices();
    if (this.isAllPageSelected()) {
      pageRows.forEach((row) => this.selection.deselect(row));
    } else {
      pageRows.forEach((row) => this.selection.select(row));
    }
    this.selectionChanged.emit(this.selection.selected);
  }

  protected isAllPageSelected(): boolean {
    const pageRows = this.pagedDevices();
    return pageRows.length > 0 && pageRows.every((row) => this.selection.isSelected(row));
  }
}
