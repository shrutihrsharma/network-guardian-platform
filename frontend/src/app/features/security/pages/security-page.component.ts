import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import {
  FilterFieldDefinition,
  FilterPanelComponent,
  FilterPanelState
} from '../../../shared/components/filter-panel.component';
import { SecurityApiService } from '../../../core/services/security-api.service';
import { SecurityFinding, SecurityFindingsFilters } from '../../../core/models/security-finding.model';
import { SecurityFindingsTableComponent } from '../components/security-findings-table.component';
import { SecurityAnalysisPanelComponent } from '../components/security-analysis-panel.component';

@Component({
  selector: 'app-security-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    FilterPanelComponent,
    SecurityFindingsTableComponent,
    SecurityAnalysisPanelComponent
  ],
  template: `
    <section class="security-page">
      <app-page-header
        title="Security Posture"
        description="Operational security findings across enterprise network devices with actionable remediation workflow."
      />

      <app-filter-panel
        [compact]="true"
        [fields]="filterFields()"
        [state]="filterState()"
        (stateChange)="onFilterStateChanged($event)"
        (resetClicked)="resetFilters()"
      />

      @if (errorMsg()) {
        <div class="error-banner">{{ errorMsg() }}</div>
      }

      <div class="content-split">
        <div class="left-col">
          <app-security-findings-table
            [findings]="displayedFindings()"
            [selectedFinding]="selectedFinding()"
            (findingSelected)="selectFinding($event)"
          />
        </div>

        <div class="right-col">
          <app-security-analysis-panel [finding]="selectedFinding()" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .security-page {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .error-banner {
      padding: 0.75rem 1rem;
      background: var(--app-danger-soft);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--app-radius-sm);
      color: var(--app-danger);
      font-size: 0.85rem;
    }

    .content-split {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 370px;
      gap: 0.75rem;
      align-items: start;
    }

    .left-col,
    .right-col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 0;
    }

    @media (max-width: 1100px) {
      .content-split {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityPageComponent implements OnInit {
  protected readonly findings = signal<SecurityFinding[]>([]);
  protected readonly selectedFinding = signal<SecurityFinding | null>(null);
  protected readonly errorMsg = signal<string | null>(null);

  protected readonly filterState = signal<FilterPanelState>({
    search: '',
    values: {
      vendor: '',
      region: '',
      category: '',
      severity: '',
      businessService: ''
    }
  });

  protected readonly filterFields = computed<FilterFieldDefinition[]>(() => {
    const current = this.findings();
    return [
      { key: 'vendor', label: 'Vendor', options: this.distinct(current.map((f) => f.vendor)) },
      { key: 'region', label: 'Region', options: this.distinct(current.map((f) => f.region)) },
      { key: 'category', label: 'Category', options: this.distinct(current.map((f) => f.category)) },
      { key: 'severity', label: 'Severity', options: this.distinct(current.map((f) => f.severity)) },
      {
        key: 'businessService',
        label: 'Business Service',
        options: this.distinct(current.map((f) => f.businessService))
      }
    ];
  });

  protected readonly displayedFindings = computed(() => {
    const query = this.filterState().search.trim().toLowerCase();
    if (!query) {
      return this.findings();
    }

    return this.findings().filter((finding) =>
      `${finding.title} ${finding.description} ${finding.deviceName} ${finding.vendor} ${finding.category}`
        .toLowerCase()
        .includes(query)
    );
  });

  constructor(private readonly securityApiService: SecurityApiService) {}

  ngOnInit(): void {
    this.fetchFindings();
  }

  protected onFilterStateChanged(nextState: FilterPanelState): void {
    const previousValues = this.filterState().values;
    this.filterState.set(nextState);

    const hasServerFilterChange =
      previousValues['vendor'] !== nextState.values['vendor'] ||
      previousValues['region'] !== nextState.values['region'] ||
      previousValues['category'] !== nextState.values['category'] ||
      previousValues['severity'] !== nextState.values['severity'] ||
      previousValues['businessService'] !== nextState.values['businessService'];

    if (hasServerFilterChange) {
      this.fetchFindings();
    }
  }

  protected resetFilters(): void {
    this.filterState.set({
      search: '',
      values: {
        vendor: '',
        region: '',
        category: '',
        severity: '',
        businessService: ''
      }
    });
    this.fetchFindings();
  }

  protected selectFinding(finding: SecurityFinding): void {
    this.selectedFinding.set(finding);
  }

  private fetchFindings(): void {
    const filters = this.filterState().values;
    const requestFilters: Omit<SecurityFindingsFilters, 'search'> = {
      vendor: filters['vendor'] || '',
      region: filters['region'] || '',
      category: filters['category'] || '',
      severity: filters['severity'] || '',
      businessService: filters['businessService'] || ''
    };

    this.securityApiService.getFindings(requestFilters).subscribe({
      next: (rows) => {
        this.findings.set(rows);
        this.errorMsg.set(null);

        const selected = this.selectedFinding();
        if (!selected) {
          this.selectedFinding.set(rows[0] ?? null);
          return;
        }

        const refreshedSelection = rows.find((row) => row.id === selected.id) ?? null;
        this.selectedFinding.set(refreshedSelection ?? rows[0] ?? null);
      },
      error: (error: Error) => {
        this.errorMsg.set(error.message);
      }
    });
  }

  private distinct(values: string[]): string[] {
    return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
  }
}
