import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { MetricCardComponent } from '../../../shared/components/metric-card.component';
import { DeviceApiService } from '../../../core/services/device-api.service';
import { DecisionApiService } from '../../../core/services/decision-api.service';
import { LifecycleApiService } from '../../../core/services/lifecycle-api.service';
import { ComplianceApiService } from '../../../core/services/compliance-api.service';
import { DecisionResponse } from '../../../core/models/decision-response.model';

interface DashboardRecommendation {
  decisionId: string;
  module: string;
  timestamp: string;
  response: DecisionResponse;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    DatePipe,
    DecimalPipe,
    MetricCardComponent,
  ],
  template: `
    <section class="dashboard-page">
      <app-page-header
        title="Operations Dashboard"
        description="Live operational status from backend services only."
      />

      @if (errorMessage()) {
        <div class="error-banner">{{ errorMessage() }}</div>
      }

      <section class="metrics-section" aria-label="Operational overview">
        <app-metric-card title="Total Devices" [value]="metricValue(totalDevices())" icon="dns" />
        <app-metric-card title="Open Incidents" [value]="metricValue(openIncidents())" icon="warning" />
        <app-metric-card title="Devices Approaching End of Support" [value]="metricValue(approachingEos())" icon="event_busy" />
        <app-metric-card title="Overall Compliance" [value]="complianceValue()" icon="verified_user" />
      </section>

      <section class="diagram-section" aria-label="Network Guardian architecture summary">
        <div class="diagram-card">
          <div class="section-heading">
            <h2>How Network Guardian works</h2>
            <p>From incident capture to AI-backed recommendation, the platform combines live context, knowledge, and model insight.</p>
          </div>

          <div class="diagram-flow">
            <div class="diagram-step step-console">
              <div class="step-title">1. Incident in dashboard</div>
              <div class="step-copy">Operator sees a flagged incident and review summary details.</div>
            </div>
            <div class="diagram-step step-engine">
              <div class="step-title">2. Context assembled</div>
              <div class="step-copy">Device, runbook, and historical incident context are collected.</div>
            </div>
            <div class="diagram-step step-knowledge">
              <div class="step-title">3. Knowledge enriched</div>
              <div class="step-copy">Relevant runbooks and enterprise guidance are added to the request.</div>
            </div>
            <div class="diagram-step step-model">
              <div class="step-title">4. AI recommendation</div>
              <div class="step-copy">The prompt is sent to the active AI provider for a guided decision.</div>
            </div>
            <div class="diagram-step step-output">
              <div class="step-title">5. Recommendation returned</div>
              <div class="step-copy">The suggested action appears in the dashboard and is stored for audit.</div>
            </div>
          </div>

          <div class="diagram-note">
            Network Guardian uses live incident data plus stored knowledge to generate explainable guidance from the chosen AI provider.
          </div>
        </div>
      </section>

      <section class="table-section">
        <div class="section-heading">
          <h2>Recent AI Recommendations</h2>
          <p>Maximum 5 most recent recommendations from backend decision history.</p>
        </div>

        <div class="recommendation-list">
          @if (recommendations().length) {
            @for (item of recommendations(); track item.decisionId) {
              <article class="recommendation-item">
                <div class="recommendation-head">
                  <strong>{{ item.response.recommendation || 'No data available' }}</strong>
                  <span>{{ item.timestamp | date:'dd MMM yyyy HH:mm' }}</span>
                </div>
                <div class="recommendation-meta">
                  <span>Module {{ item.module || 'Unknown' }}</span>
                  <span>Risk {{ item.response.risk || 'No data available' }}</span>
                  <span>Confidence {{ item.response.confidence | number:'1.0-0' }}%</span>
                  <span>ID {{ item.decisionId }}</span>
                </div>
              </article>
            }
          } @else {
            <p class="empty-state">No data available</p>
          }
        </div>
      </section>
    </section>
  `,
  styles: `
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
    }

    .metrics-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .table-section {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .error-banner {
      padding: 0.7rem 0.85rem;
      border-radius: var(--app-radius-sm);
      background: var(--app-danger-soft);
      border: 1px solid rgba(239, 68, 68, 0.28);
      color: var(--app-danger);
      font-size: 0.82rem;
    }

    .section-heading {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    h2 {
      margin: 0;
      color: var(--app-text);
      font-size: 1.05rem;
      font-weight: 700;
    }

    .section-heading p {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .recommendation-list {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .recommendation-item {
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      background: var(--app-surface);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .recommendation-head {
      display: flex;
      justify-content: space-between;
      gap: 0.7rem;
      flex-wrap: wrap;
    }

    .recommendation-head strong {
      color: var(--app-text);
      font-size: 0.86rem;
      font-weight: 600;
    }

    .recommendation-head span {
      color: var(--app-text-muted);
      font-size: 0.72rem;
    }

    .recommendation-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .recommendation-meta span {
      color: var(--app-text-muted);
      font-size: 0.68rem;
      padding: 0.18rem 0.45rem;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      background: var(--app-card-bg);
    }

    .diagram-section {
      display: flex;
      justify-content: center;
    }

    .diagram-card {
      width: 100%;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-lg);
      padding: 1.35rem;
      box-shadow: 0 24px 50px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .diagram-flow {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 1rem;
      align-items: stretch;
    }

    .diagram-step {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 112px;
      padding: 1rem;
      border-radius: var(--app-radius-md);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
      border: 1px solid rgba(148, 163, 184, 0.16);
      box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
      gap: 0.4rem;
    }

    .step-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .step-copy {
      font-size: 0.84rem;
      color: var(--app-text-muted);
      line-height: 1.5;
    }

    .step-console {
      background: linear-gradient(180deg, rgba(59, 130, 246, 0.14), rgba(255, 255, 255, 0.95));
      border-color: rgba(59, 130, 246, 0.32);
    }

    .step-engine {
      background: linear-gradient(180deg, rgba(16, 185, 129, 0.14), rgba(255, 255, 255, 0.95));
      border-color: rgba(16, 185, 129, 0.32);
    }

    .step-knowledge {
      background: linear-gradient(180deg, rgba(249, 115, 22, 0.14), rgba(255, 255, 255, 0.95));
      border-color: rgba(249, 115, 22, 0.32);
    }

    .step-model {
      background: linear-gradient(180deg, rgba(168, 85, 247, 0.14), rgba(255, 255, 255, 0.95));
      border-color: rgba(168, 85, 247, 0.32);
    }

    .step-output {
      background: linear-gradient(180deg, rgba(234, 179, 8, 0.14), rgba(255, 255, 255, 0.95));
      border-color: rgba(234, 179, 8, 0.32);
    }

    .diagram-note {
      padding: 1rem;
      border-radius: var(--app-radius-md);
      background: rgba(15, 23, 42, 0.03);
      border: 1px solid rgba(148, 163, 184, 0.16);
      color: var(--app-text-muted);
      font-size: 0.85rem;
      line-height: 1.55;
    }

    .empty-state {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.84rem;
      border: 1px dashed var(--app-border);
      border-radius: var(--app-radius-sm);
      padding: 0.85rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly deviceApi = inject(DeviceApiService);
  private readonly decisionApi = inject(DecisionApiService);
  private readonly lifecycleApi = inject(LifecycleApiService);
  private readonly complianceApi = inject(ComplianceApiService);

  protected readonly totalDevices = signal<number | null>(null);
  protected readonly openIncidents = signal<number | null>(null);
  protected readonly approachingEos = signal<number | null>(null);
  protected readonly overallCompliance = signal<number | null>(null);
  protected readonly recommendations = signal<DashboardRecommendation[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly complianceValue = computed(() => {
    const value = this.overallCompliance();
    return value === null ? 'No data available' : `${value.toFixed(1)}%`;
  });

  constructor() {
    this.load();
  }

  protected metricValue(value: number | null): string {
    return value === null ? 'No data available' : String(value);
  }

  private load() {
    this.deviceApi.getDevices().subscribe({
      next: (devices) => this.totalDevices.set(devices.length),
      error: () => this.totalDevices.set(null),
    });

    this.decisionApi.getIncidents().subscribe({
      next: (incidents) => {
        const open = incidents.filter((item) => item.status?.toUpperCase() !== 'RESOLVED').length;
        this.openIncidents.set(open);
      },
      error: () => this.openIncidents.set(null),
    });

    this.lifecycleApi.getDashboard().subscribe({
      next: (dashboard) => this.approachingEos.set(dashboard.upcomingEol90Days),
      error: () => this.approachingEos.set(null),
    });

    this.complianceApi.getSummary().subscribe({
      next: (summary) => this.overallCompliance.set(summary.averageCompliance),
      error: () => this.overallCompliance.set(null),
    });

    this.complianceApi.getDecisionHistory().subscribe({
      next: (rows) => {
        const recent = rows
          .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
          .slice(0, 5)
          .map((row) => ({
            decisionId: row.decisionId,
            module: row.module || row.engine,
            timestamp: row.timestamp,
            response: row.decisionResponse,
          }));
        this.recommendations.set(recent);
      },
      error: () => {
        this.recommendations.set([]);
        this.errorMessage.set('Decision history is currently unavailable.');
      },
    });
  }
}
