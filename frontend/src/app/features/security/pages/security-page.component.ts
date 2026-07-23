import { ChangeDetectionStrategy, Component, OnInit, computed, effect, signal } from '@angular/core';
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
            [findings]="pagedFindings()"
            [selectedFinding]="selectedFinding()"
            [currentPage]="currentPage()"
            [pageSize]="pageSize()"
            [totalFindings]="displayedFindings().length"
            [pageNumbers]="pageNumbers()"
            [rangeStart]="rangeStart()"
            [rangeEnd]="rangeEnd()"
            (findingSelected)="selectFinding($event)"
            (pageChanged)="setPage($event)"
            (pageSizeChanged)="setPageSize($event)"
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
      gap: 0.6rem;
      min-height: calc(100vh - 10.5rem);
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
      gap: 0.7rem;
      align-items: stretch;
      height: clamp(34rem, calc(100vh - 16rem), 48rem);
      min-height: 0;
    }

    .left-col,
    .right-col {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      min-width: 0;
      min-height: 0;
    }

    @media (max-width: 1100px) {
      .content-split {
        grid-template-columns: 1fr;
        height: auto;
      }

      .left-col,
      .right-col {
        min-height: 24rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityPageComponent implements OnInit {
  protected readonly findings = signal<SecurityFinding[]>([]);
  protected readonly selectedFinding = signal<SecurityFinding | null>(null);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(20);

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

  protected readonly totalPages = computed(() => {
    const total = this.displayedFindings().length;
    const pages = Math.ceil(total / this.pageSize());
    return Math.max(1, pages);
  });

  protected readonly pagedFindings = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;
    return this.displayedFindings().slice(start, end);
  });

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, idx) => idx + 1)
  );

  protected readonly rangeStart = computed(() => {
    const total = this.displayedFindings().length;
    if (!total) {
      return 0;
    }
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  protected readonly rangeEnd = computed(() => {
    const total = this.displayedFindings().length;
    if (!total) {
      return 0;
    }
    return Math.min(this.currentPage() * this.pageSize(), total);
  });

  constructor(private readonly securityApiService: SecurityApiService) {}

  private readonly paginationSync = effect(
    () => {
      const totalPages = this.totalPages();
      const currentPage = this.currentPage();
      if (currentPage > totalPages) {
        this.currentPage.set(totalPages);
        return;
      }

      const visibleRows = this.pagedFindings();
      if (!visibleRows.length) {
        this.selectedFinding.set(null);
        return;
      }

      const selected = this.selectedFinding();
      if (!selected || !visibleRows.some((row) => row.id === selected.id)) {
        this.selectedFinding.set(visibleRows[0]);
      }
    },
    { allowSignalWrites: true }
  );

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
    this.currentPage.set(1);
    this.fetchFindings();
  }

  protected selectFinding(finding: SecurityFinding): void {
    this.selectedFinding.set(finding);
  }

  protected setPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
  }

  protected setPageSize(size: number): void {
    if (![10, 20, 50].includes(size)) {
      return;
    }
    this.pageSize.set(size);
    this.currentPage.set(1);
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
        this.currentPage.set(1);

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
