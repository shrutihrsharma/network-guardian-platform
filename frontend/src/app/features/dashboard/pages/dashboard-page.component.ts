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
            <h2>Network Guardian Architecture</h2>
            <p>Visual summary of the frontend, backend decision agents, RAG retrieval, and AI provider flow.</p>
          </div>
          <div class="architecture-diagram" role="img" aria-label="Network Guardian architecture diagram">
            <svg viewBox="0 0 1020 480" preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
                </marker>
              </defs>

              <rect x="40" y="24" width="260" height="84" rx="16" fill="rgba(56, 114, 255, 0.12)" stroke="rgba(56, 114, 255, 0.38)" stroke-width="2" />
              <text x="170" y="48" text-anchor="middle" font-size="15" font-weight="700" fill="#111827">Frontend UI</text>
              <text x="170" y="68" text-anchor="middle" font-size="12" fill="#4b5563">Angular dashboard & incident workspace</text>

              <rect x="360" y="24" width="300" height="84" rx="16" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.38)" stroke-width="2" />
              <text x="510" y="44" text-anchor="middle" font-size="15" font-weight="700" fill="#111827">Backend REST API</text>
              <text x="510" y="64" text-anchor="middle" font-size="12" fill="#4b5563">Controllers route requests to decision modules</text>

              <line x1="300" y1="66" x2="360" y2="66" stroke="rgba(107, 114, 128, 0.65)" stroke-width="2" marker-end="url(#arrow)" />

              <rect x="80" y="140" width="260" height="138" rx="16" fill="rgba(248, 113, 113, 0.12)" stroke="rgba(248, 113, 113, 0.38)" stroke-width="2" />
              <text x="210" y="168" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">Decision Engines</text>
              <text x="210" y="188" text-anchor="middle" font-size="11" fill="#4b5563">Incident / Compliance / Lifecycle / Security</text>
              <text x="210" y="206" text-anchor="middle" font-size="11" fill="#4b5563">AI decision orchestration services</text>

              <rect x="400" y="140" width="260" height="138" rx="16" fill="rgba(59, 130, 246, 0.12)" stroke="rgba(59, 130, 246, 0.38)" stroke-width="2" />
              <text x="530" y="168" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">Context & Prompt</text>
              <text x="530" y="188" text-anchor="middle" font-size="11" fill="#4b5563">PromptBuilder + IncidentContextBuilder</text>
              <text x="530" y="206" text-anchor="middle" font-size="11" fill="#4b5563">Builds incident, device, runbook, history</text>

              <rect x="720" y="140" width="260" height="138" rx="16" fill="rgba(168, 85, 247, 0.12)" stroke="rgba(168, 85, 247, 0.38)" stroke-width="2" />
              <text x="850" y="168" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">RAG & Data</text>
              <text x="850" y="188" text-anchor="middle" font-size="11" fill="#4b5563">RAGRetrievalService + MongoDB</text>
              <text x="850" y="206" text-anchor="middle" font-size="11" fill="#4b5563">Enterprise knowledge, runbooks, audits</text>

              <line x1="510" y1="108" x2="510" y2="140" stroke="rgba(107, 114, 128, 0.65)" stroke-width="2" marker-end="url(#arrow)" />

              <line x1="230" y1="264" x2="230" y2="294" stroke="rgba(107, 114, 128, 0.65)" stroke-width="2" marker-end="url(#arrow)" />
              <line x1="530" y1="264" x2="530" y2="294" stroke="rgba(107, 114, 128, 0.65)" stroke-width="2" marker-end="url(#arrow)" />
              <line x1="850" y1="264" x2="850" y2="294" stroke="rgba(107, 114, 128, 0.65)" stroke-width="2" marker-end="url(#arrow)" />

              <rect x="200" y="304" width="250" height="108" rx="16" fill="rgba(251, 191, 36, 0.12)" stroke="rgba(251, 191, 36, 0.38)" stroke-width="2" />
              <text x="325" y="332" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">AI Clients</text>
              <text x="325" y="352" text-anchor="middle" font-size="11" fill="#4b5563">GroqClient (active), OpenRouterClient, GeminiClient</text>

              <rect x="560" y="304" width="260" height="108" rx="16" fill="rgba(34, 197, 94, 0.12)" stroke="rgba(34, 197, 94, 0.38)" stroke-width="2" />
              <text x="690" y="332" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">External LLMs</text>
              <text x="690" y="352" text-anchor="middle" font-size="11" fill="#4b5563">GROQ / OpenRouter / Gemini endpoints</text>

              <line x1="450" y1="358" x2="560" y2="358" stroke="rgba(107, 114, 128, 0.65)" stroke-width="2" marker-end="url(#arrow)" />
            </svg>
          </div>
          <div class="diagram-legend">
            <div>
              <strong>Backend decision agents</strong>
              <p>Incident, Compliance, Lifecycle, Security modules all route through AI client adapters.</p>
            </div>
            <div>
              <strong>RAG & enterprise knowledge</strong>
              <p>RAGRetrievalService gathers runbooks and knowledge docs from Mongo to enrich AI prompts.</p>
            </div>
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
