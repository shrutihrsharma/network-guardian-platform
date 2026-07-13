import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface FilterFieldDefinition {
  key: string;
  label: string;
  options: string[];
}

export interface FilterPanelState {
  search: string;
  values: Record<string, string>;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <section class="filter-panel">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search hostname or device name</mat-label>
        <input
          matInput
          [ngModel]="state().search"
          (ngModelChange)="onSearchChanged($event)"
          placeholder="Search"
        />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="filter-grid">
        @for (field of fields(); track field.key) {
          <mat-form-field appearance="outline">
            <mat-label>{{ field.label }}</mat-label>
            <mat-select
              [ngModel]="state().values[field.key] || ''"
              (ngModelChange)="onFilterChanged(field.key, $event)"
            >
              <mat-option value="">All</mat-option>
              @for (option of field.options; track option) {
                <mat-option [value]="option">{{ option }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </div>

      <div class="filter-actions">
        <button mat-stroked-button type="button" (click)="resetClicked.emit()">Reset Filters</button>
      </div>
    </section>
  `,
  styles: `
    .filter-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      background: var(--app-surface);
    }

    .search-field {
      width: 100%;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 0.8rem;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPanelComponent {
  readonly fields = input.required<FilterFieldDefinition[]>();
  readonly state = input.required<FilterPanelState>();

  readonly stateChange = output<FilterPanelState>();
  readonly resetClicked = output<void>();

  onSearchChanged(search: string): void {
    this.stateChange.emit({
      ...this.state(),
      search
    });
  }

  onFilterChanged(key: string, value: string): void {
    this.stateChange.emit({
      ...this.state(),
      values: {
        ...this.state().values,
        [key]: value
      }
    });
  }
}
