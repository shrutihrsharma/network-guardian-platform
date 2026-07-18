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
    <section class="filter-panel" [class.filter-panel--compact]="compact()">
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
      gap: 0.75rem;
      padding: 0.9rem;
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
      gap: 0.7rem;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
    }

    .filter-panel--compact {
      gap: 0.5rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.75rem;
    }

    .filter-panel--compact .filter-grid {
      gap: 0.55rem;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .filter-panel--compact .filter-actions {
      margin-top: 0.1rem;
    }

    .filter-panel--compact :is(.mat-mdc-form-field-subscript-wrapper, .mdc-notched-outline__notch) {
      display: none;
    }

    .filter-panel--compact .mat-mdc-form-field {
      --mat-form-field-container-height: 42px;
      --mat-form-field-container-vertical-padding: 8px;
      font-size: 0.83rem;
    }

    .filter-panel--compact .mat-mdc-text-field-wrapper {
      background: rgba(15, 23, 42, 0.45);
    }

    .filter-panel--compact .mat-mdc-stroked-button {
      min-height: 34px;
      padding: 0 0.75rem;
      font-size: 0.78rem;
      letter-spacing: 0.02em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPanelComponent {
  readonly fields = input.required<FilterFieldDefinition[]>();
  readonly state = input.required<FilterPanelState>();
  readonly compact = input(false);

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
