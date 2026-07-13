import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { DecisionEngineCardComponent } from '../../../shared/components/decision-engine-card.component';
import { MetricCardComponent } from '../../../shared/components/metric-card.component';
import { PipelineStepComponent } from '../../../shared/components/pipeline-step.component';
import { DecisionTableComponent } from '../../../shared/components/decision-table.component';
import { DecisionEngine } from '../../../shared/models/decision-engine.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    DecisionEngineCardComponent,
    MetricCardComponent,
    PipelineStepComponent,
    DecisionTableComponent
  ],
  template: `
    <section class="dashboard-page">
      <app-page-header
        title="AI Decision Center"
        description="Operational decision intelligence built for trusted, explainable enterprise actions."
      />

      <section class="metrics-section" aria-label="Platform overview">
        <app-metric-card title="AI Decisions Today" value="31" icon="psychology" />
        <app-metric-card title="Average Confidence" value="98.3%" icon="verified" />
        <app-metric-card title="Average Decision Time" value="742 ms" icon="bolt" />
        <app-metric-card title="Decision Engines" value="6" icon="hub" />
        <app-metric-card title="Pending Approval" value="1" icon="approval" />
        <app-metric-card title="Platform Health" value="Healthy" icon="monitor_heart" />
      </section>

      <section class="engine-section">
        <div class="section-heading">
          <h2>Platform Modules</h2>
          <p>Core operational modules in the Network Operations AI Platform.</p>
        </div>
        <div class="engine-grid">
          @for (engine of engines; track engine.id) {
            <app-decision-engine-card [engine]="engine" />
          }
        </div>
      </section>

      <section class="pipeline-section">
        <div class="section-heading">
          <h2>How AI Decisions Are Made</h2>
          <p>A clear architectural preview of the reasoning workflow behind each recommendation.</p>
        </div>
        <div class="pipeline-shell">
          <app-pipeline-step label="Context Builder" description="Operational context" />
          <div class="pipeline-arrow">→</div>
          <app-pipeline-step label="Prompt Builder" description="Decision framing" />
          <div class="pipeline-arrow">→</div>
          <app-pipeline-step label="AI Model" description="Inference layer" />
          <div class="pipeline-arrow">→</div>
          <app-pipeline-step label="Decision Recommendation" description="Actionable guidance" />
          <div class="pipeline-arrow">→</div>
          <app-pipeline-step label="Decision Audit" description="Traceable review" />
        </div>
      </section>

      <section class="table-section">
        <div class="section-heading">
          <h2>Recent AI Decisions</h2>
          <p>Recent operational decisions surfaced from the platform.</p>
        </div>
        <app-decision-table />
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

    .engine-section,
    .pipeline-section,
    .table-section {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
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

    .engine-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }

    .pipeline-shell {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.65rem;
      padding: 0.75rem 0;
    }

    .pipeline-arrow {
      color: var(--app-text-muted);
      font-size: 1.1rem;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  readonly engines: DecisionEngine[] = [
    {
      id: 'devices',
      title: 'Device Operations',
      description: 'Device-centric inventory operations across lifecycle, compliance, and risk.',
      icon: 'dns',
      route: '/devices',
      status: 'READY',
      metrics: { today: '20', confidence: '99%', response: '420 ms' }
    },
    {
      id: 'incident',
      title: 'Incident Operations',
      description: 'AI-powered incident analysis and remediation orchestration.',
      icon: 'warning',
      route: '/incidents',
      status: 'READY',
      metrics: { today: '31', confidence: '98%', response: '742 ms' }
    },
    {
      id: 'lifecycle',
      title: 'Lifecycle Operations',
      description: 'Lifecycle governance and support transition visibility.',
      icon: 'timeline',
      route: '/lifecycle',
      status: 'READY',
      metrics: { today: '—', confidence: '—', response: '—' }
    },
    {
      id: 'compliance',
      title: 'Compliance Operations',
      description: 'Compliance posture and governance control insights.',
      icon: 'verified_user',
      route: '/compliance',
      status: 'READY',
      metrics: { today: '—', confidence: '—', response: '—' }
    },
    {
      id: 'predictive-risk',
      title: 'Predictive Risk',
      description: 'Forecast device and service risk with AI-assisted mitigation guidance.',
      icon: 'analytics',
      route: '/predictive-risk',
      status: 'READY',
      metrics: { today: '—', confidence: '—', response: '—' }
    }
  ];
}
