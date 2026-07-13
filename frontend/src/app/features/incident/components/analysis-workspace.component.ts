import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecisionResponse } from '../../../core/models/decision-response.model';
import { IncidentSummary } from '../../../core/models/incident-summary.model';

@Component({
  selector: 'app-analysis-workspace',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="workspace-card">
      <div class="workspace-card__header">
        <div>
          <h3>Decision Workspace</h3>
          <p>The AI recommendation and remediation guidance are now available.</p>
        </div>
      </div>

      <div class="workspace-grid">
        <div class="workspace-panel">
          <h4>Incident Summary</h4>
          <div class="detail-row"><span>Incident</span><strong>{{ incident()?.id }}</strong></div>
          <div class="detail-row"><span>Device</span><strong>{{ incident()?.device }}</strong></div>
          <div class="detail-row"><span>Severity</span><strong>{{ incident()?.severity }}</strong></div>
          <div class="detail-row"><span>Status</span><strong>{{ incident()?.status }}</strong></div>
          <div class="detail-row"><span>Business Service</span><strong>{{ incident()?.businessService || 'Pending' }}</strong></div>
        </div>

        <div class="workspace-panel">
          <h4>Recommendation</h4>
          <div class="recommendation-title">{{ response()?.recommendation || 'Pending' }}</div>
          <div class="detail-row"><span>Confidence</span><strong>{{ response()?.confidence ? (response()?.confidence | number:'1.0-0') + '%' : 'Pending' }}</strong></div>
          <div class="detail-row"><span>Business Impact</span><strong>{{ response()?.businessImpact || 'Pending' }}</strong></div>
          <div class="detail-row"><span>Approval Required</span><strong>{{ response()?.approvalRequired ? 'Yes' : 'No' }}</strong></div>
          <div class="detail-row"><span>Decision Id</span><strong>{{ response()?.decisionId || 'Pending' }}</strong></div>
          <div class="detail-row"><span>AI Provider</span><strong>{{ response()?.provider || 'Pending' }}</strong></div>
          <div class="detail-row"><span>Latency</span><strong>{{ response()?.executionTimeMs ? response()?.executionTimeMs + ' ms' : 'Pending' }}</strong></div>
        </div>
      </div>

      <div class="workspace-panel workspace-panel--wide">
        <h4>Reasoning</h4>
        <p>{{ response()?.reasoning || 'The reasoning will appear here once the AI response is available.' }}</p>
      </div>

      <div class="workspace-panel workspace-panel--wide">
        <h4>Evidence</h4>
        <ul>
          @for (item of response()?.evidence || []; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .workspace-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .workspace-card__header h3 {
      margin: 0 0 0.25rem;
      color: var(--app-text);
      font-size: 1.02rem;
      font-weight: 700;
    }

    .workspace-card__header p {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.9rem;
    }

    .workspace-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .workspace-panel {
      border: 1px solid var(--app-border);
      border-radius: 0.9rem;
      padding: 0.9rem;
      background: rgba(255,255,255,0.02);
    }

    .workspace-panel--wide {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .workspace-panel h4 {
      margin: 0 0 0.65rem;
      color: var(--app-text);
      font-size: 0.95rem;
      font-weight: 700;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
      padding: 0.35rem 0;
      border-bottom: 1px solid var(--app-border);
      color: var(--app-text-muted);
      font-size: 0.9rem;
    }

    .detail-row:last-child {
      border-bottom: 0;
    }

    .detail-row strong {
      color: var(--app-text);
      text-align: right;
    }

    .recommendation-title {
      color: var(--app-text);
      font-weight: 700;
      margin-bottom: 0.6rem;
    }

    ul {
      margin: 0;
      padding-left: 1rem;
      color: #cbd5e1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysisWorkspaceComponent {
  readonly incident = input<IncidentSummary | null>(null);
  readonly response = input<DecisionResponse | null>(null);
}
