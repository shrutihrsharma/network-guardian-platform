import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ComplianceApiService } from '../../../core/services/compliance-api.service';
import { ComplianceKriTableRow } from '../../../core/models/compliance.model';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { ComplianceKriTableComponent } from '../components/compliance-kri-table.component';

@Component({
  selector: 'app-compliance-kri-review-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, ComplianceKriTableComponent],
  template: `
    <section class="review-page">
      <app-page-header
        title="AI Generated KRIs Review"
        description="Review, approve, or reject AI-suggested KRIs before they are used in enterprise compliance calculations."
      />

      <div class="toolbar">
        <button mat-stroked-button [routerLink]="['/compliance']">
          <mat-icon>arrow_back</mat-icon>
          Back to Compliance Operations
        </button>

        <button mat-flat-button class="primary" (click)="generate()" [disabled]="busy()">
          <mat-icon>auto_awesome</mat-icon>
          Generate New Suggestions
        </button>
      </div>

      @if (statusMessage()) {
        <div class="status-banner">{{ statusMessage() }}</div>
      }

      @if (errorMessage()) {
        <div class="error-banner">{{ errorMessage() }}</div>
      }

      <app-compliance-kri-table
        [rows]="rows()"
        [showReviewActions]="true"
        [displayedColumns]="displayedColumns"
        (approve)="approve($event)"
        (reject)="reject($event)"
      />
    </section>
  `,
  styles: `
    .review-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
    }

    .primary {
      background: var(--app-primary) !important;
      color: #0b1220 !important;
      font-weight: 700;
    }

    .status-banner,
    .error-banner {
      padding: 0.7rem 0.85rem;
      border-radius: var(--app-radius-sm);
      font-size: 0.82rem;
    }

    .status-banner {
      background: var(--app-accent-soft);
      border: 1px solid rgba(6, 182, 212, 0.28);
      color: var(--app-accent);
    }

    .error-banner {
      background: var(--app-danger-soft);
      border: 1px solid rgba(239, 68, 68, 0.28);
      color: var(--app-danger);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceKriReviewPageComponent {
  private readonly complianceApi = inject(ComplianceApiService);

  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly statusMessage = signal<string | null>(null);
  private readonly allRows = signal<ComplianceKriTableRow[]>([]);

  protected readonly rows = computed(() =>
    this.allRows()
      .filter((row) => row.aiGenerated)
      .sort((a, b) => Number(a.approved) - Number(b.approved) || a.name.localeCompare(b.name))
  );

  protected readonly displayedColumns = [
    'name',
    'category',
    'severity',
    'threshold',
    'currentValue',
    'status',
    'aiGenerated',
    'approved',
    'actions',
  ];

  constructor() {
    this.load();
  }

  protected generate() {
    this.busy.set(true);
    this.statusMessage.set(null);
    this.complianceApi.generateKri({}).subscribe({
      next: (response) => {
        this.statusMessage.set(`Generated ${response.suggestedKris.length} AI suggested KRIs.`);
        this.load();
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  protected approve(kriId: string) {
    this.updateKriApproval(kriId, true, 'approved and enabled');
  }

  protected reject(kriId: string) {
    this.updateKriApproval(kriId, false, 'rejected for future calculations');
  }

  private updateKriApproval(kriId: string, enabled: boolean, actionLabel: string) {
    this.busy.set(true);
    this.statusMessage.set(null);
    this.complianceApi.approveKri({ kriId, enabled }).subscribe({
      next: () => {
        this.statusMessage.set(`KRI ${kriId} ${actionLabel}.`);
        this.load();
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  private load() {
    this.busy.set(true);
    this.errorMessage.set(null);

    this.complianceApi.getKris().subscribe({
      next: (kris) => {
        this.allRows.set(
          kris.map((kri) => ({
            id: kri.id,
            name: kri.name,
            category: kri.category,
            severity: kri.severity,
            threshold: kri.threshold,
            currentValue: 0,
            status: 'Passing' as const,
            aiGenerated: kri.aiGenerated,
            approved: kri.approved,
            enabled: kri.enabled,
            description: kri.description,
          }))
        );
        this.busy.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.busy.set(false);
      },
    });
  }
}
