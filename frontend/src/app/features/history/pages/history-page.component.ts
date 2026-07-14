import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

interface DecisionAuditRow {
  decisionId: string;
  timestamp: string;
  incidentId: string;
  module: string;
  engine: string;
  provider: string;
  model: string;
  decisionResponse: {
    confidence: number;
    recommendation: string;
    risk?: string;
    decisionStatus: string;
  };
}

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [DatePipe, CommonModule, MatTableModule, MatIconModule, PageHeaderComponent],
  template: `
    <section class="history-page">
      <app-page-header
        title="Decision History"
        description="Auditable AI decision records across all modules — Incident, Lifecycle, and future engines."
      />

      @if (errorMsg()) {
        <div class="error-banner">{{ errorMsg() }}</div>
      }

      <div class="table-card">
        <table mat-table [dataSource]="rows()">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Timestamp</th>
            <td mat-cell *matCellDef="let r">{{ r.timestamp | date:'dd MMM yyyy HH:mm' }}</td>
          </ng-container>

          <ng-container matColumnDef="module">
            <th mat-header-cell *matHeaderCellDef>Module</th>
            <td mat-cell *matCellDef="let r">
              <span class="module-chip" [class]="moduleClass(r.module ?? r.engine)">
                {{ r.module ?? r.engine }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="entityId">
            <th mat-header-cell *matHeaderCellDef>Entity ID</th>
            <td mat-cell *matCellDef="let r">
              <span class="mono">{{ r.incidentId }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="recommendation">
            <th mat-header-cell *matHeaderCellDef>Recommendation</th>
            <td mat-cell *matCellDef="let r">
              <span class="rec-text">{{ r.decisionResponse?.recommendation ?? '—' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="confidence">
            <th mat-header-cell *matHeaderCellDef>Confidence</th>
            <td mat-cell *matCellDef="let r">
              <span class="confidence-val">{{ r.decisionResponse?.confidence ?? 0 | number:'1.0-0' }}%</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="risk">
            <th mat-header-cell *matHeaderCellDef>Risk</th>
            <td mat-cell *matCellDef="let r">
              @if (r.decisionResponse?.risk) {
                <span class="risk-chip" [class]="'risk-' + r.decisionResponse.risk.toLowerCase()">
                  {{ r.decisionResponse.risk }}
                </span>
              } @else {
                <span class="muted">—</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="provider">
            <th mat-header-cell *matHeaderCellDef>Provider / Model</th>
            <td mat-cell *matCellDef="let r">
              <div class="provider-cell">
                <span>{{ r.provider }}</span>
                <span class="muted model-name">{{ r.model }}</span>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let r; columns: columns"></tr>
        </table>

        @if (!rows().length && !errorMsg()) {
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <p>No decision records found. Run an AI decision to see history here.</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .history-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .error-banner {
      padding: 0.75rem 1rem;
      background: var(--app-danger-soft);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: var(--app-radius-sm);
      color: var(--app-danger);
      font-size: 0.85rem;
    }

    .table-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: var(--app-radius);
      overflow: hidden;
    }

    table { width: 100%; background: transparent; }

    .mat-mdc-header-cell {
      font-size: 0.72rem !important;
      font-weight: 700 !important;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--app-text-muted) !important;
    }

    .module-chip {
      display: inline-block;
      padding: 0.18rem 0.55rem;
      border-radius: 0.35rem;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .module-incident  { background: rgba(6,182,212,0.12); color: #06b6d4; border: 1px solid rgba(6,182,212,0.25); }
    .module-lifecycle { background: rgba(34,197,94,0.12);  color: var(--app-success); border: 1px solid rgba(34,197,94,0.25); }
    .module-default   { background: var(--app-surface-strong); color: var(--app-text-muted); border: 1px solid var(--app-border); }

    .mono { font-family: monospace; font-size: 0.8rem; color: var(--app-accent); }

    .rec-text { font-size: 0.84rem; color: var(--app-text); font-weight: 500; }

    .confidence-val { font-size: 0.84rem; font-weight: 700; color: var(--app-success); }

    .risk-chip {
      display: inline-block;
      padding: 0.18rem 0.5rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .risk-critical { background: var(--app-danger-soft);  color: var(--app-danger); }
    .risk-high     { background: var(--app-warning-soft); color: var(--app-warning); }
    .risk-medium   { background: rgba(234,179,8,0.12);    color: #eab308; }
    .risk-low      { background: var(--app-success-soft); color: var(--app-success); }

    .provider-cell {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .muted { color: var(--app-text-muted); }
    .model-name { font-size: 0.72rem; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 3rem;
      color: var(--app-text-muted);
      text-align: center;
    }

    .empty-state mat-icon { font-size: 2rem; width: 2rem; height: 2rem; opacity: 0.3; }
    .empty-state p { margin: 0; font-size: 0.9rem; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPageComponent implements OnInit {
  protected readonly rows = signal<DecisionAuditRow[]>([]);
  protected readonly errorMsg = signal<string | null>(null);

  readonly columns = ['timestamp', 'module', 'entityId', 'recommendation', 'confidence', 'risk', 'provider'];

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<DecisionAuditRow[]>(`${environment.apiBaseUrl}/decision-engines/history`)
      .subscribe({
        next: data => this.rows.set([...data].reverse()),
        error: (e: Error) => this.errorMsg.set(e.message),
      });
  }

  protected moduleClass(module: string): string {
    const m = (module ?? '').toLowerCase();
    if (m === 'incident') return 'module-incident';
    if (m === 'lifecycle') return 'module-lifecycle';
    return 'module-default';
  }
}
