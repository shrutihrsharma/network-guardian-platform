import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { DecisionTimelineComponent } from '../components/decision-timeline.component';
import { DecisionApiService } from '../../../core/services/decision-api.service';
import { DecisionResponse } from '../../../core/models/decision-response.model';
import { IncidentSummary } from '../../../core/models/incident-summary.model';
import { IncidentQueueComponent } from '../components/incident-queue.component';
import { AnalysisPipelineComponent, AnalysisPipelineStep } from '../components/analysis-pipeline.component';
import { AnalysisWorkspaceComponent } from '../components/analysis-workspace.component';
import { RemediationWorkspaceComponent } from '../components/remediation-workspace.component';
import { FollowUpAssistantComponent } from '../components/follow-up-assistant.component';

@Component({
  selector: 'app-incident-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    IncidentQueueComponent,
    AnalysisPipelineComponent,
    AnalysisWorkspaceComponent,
    RemediationWorkspaceComponent,
    FollowUpAssistantComponent,
    DecisionTimelineComponent
  ],
  template: `
    <section class="incident-page">
      <app-page-header
        title="Incident Decision"
        description="Explainable incident analysis for enterprise operations, with visible reasoning and auditable recommendations."
      />

      <app-incident-queue
        [incidents]="incidents()"
        [selectedIncident]="selectedIncident()"
        [disabled]="isLoading()"
        (incidentSelected)="selectIncident($event)"
      />

      @if (isLoading()) {
        <app-analysis-pipeline [steps]="pipelineSteps()" />
      }

      @if (!isLoading() && response()) {
        <app-analysis-workspace [incident]="selectedIncident()" [response]="response()" />
        <app-remediation-workspace [incident]="selectedIncident()" />
        <app-follow-up-assistant />
      }

      @if (errorMessage()) {
        <div class="error-banner">
          <span>{{ errorMessage() }}</span>
          <button type="button" (click)="analyzeIncident()">Retry</button>
        </div>
      }

      <div class="timeline-section">
        <app-decision-timeline />
      </div>
    </section>
  `,
  styles: `
    .incident-page {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .timeline-section {
      margin-top: 0.2rem;
    }

    .error-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.8rem 1rem;
      border: 1px solid rgba(239, 68, 68, 0.28);
      border-radius: 0.9rem;
      background: rgba(239, 68, 68, 0.12);
      color: #fecaca;
    }

    .error-banner button {
      border: 0;
      border-radius: 999px;
      padding: 0.45rem 0.8rem;
      background: var(--app-primary);
      color: white;
      cursor: pointer;
    }

    @media (max-width: 960px) {
      .incident-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentPageComponent implements OnInit {
  readonly isLoading = signal(false);
  readonly response = signal<DecisionResponse | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly incidents = signal<IncidentSummary[]>([]);
  readonly selectedIncident = signal<IncidentSummary | null>(null);
  readonly pipelineSteps = signal<AnalysisPipelineStep[]>([
    { title: 'Incident Selected', description: 'The operational incident was selected and queued for analysis.', status: 'pending' },
    { title: 'Loading Device Context', description: 'Device inventory and service metadata are being loaded.', status: 'pending' },
    { title: 'Loading Historical Incidents', description: 'Prior incident outcomes are being retrieved for comparison.', status: 'pending' },
    { title: 'Loading Runbook', description: 'Relevant runbook guidance is being collected.', status: 'pending' },
    { title: 'Building Incident Context', description: 'The incident context is being assembled for the AI engine.', status: 'pending' },
    { title: 'Building AI Prompt', description: 'The operational facts are being framed into a decision prompt.', status: 'pending' },
    { title: 'Calling AI Provider', description: 'The provider is generating a recommendation.', status: 'pending' },
    { title: 'Parsing AI Response', description: 'The response is being structured into a decision.', status: 'pending' },
    { title: 'Building Recommendation', description: 'The recommendation and impact summary are being prepared.', status: 'pending' },
    { title: 'Creating Decision Audit', description: 'The decision is being recorded for traceability.', status: 'pending' }
  ]);

  constructor(private readonly decisionApi: DecisionApiService) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.decisionApi.getIncidents().subscribe({
      next: (incidents) => {
        this.incidents.set(incidents);
        if (!this.selectedIncident() && incidents.length) {
          this.selectedIncident.set(incidents[0]);
        }
      },
      error: () => {
        this.errorMessage.set('Unable to load incident queue.');
      }
    });
  }

  selectIncident(incident: IncidentSummary): void {
    this.selectedIncident.set(incident);
    this.errorMessage.set(null);
    this.analyzeIncident();
  }

  analyzeIncident(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.response.set(null);
    this.pipelineSteps.set(this.pipelineSteps().map((step) => ({ ...step, status: 'pending' })));

    this.pipelineSteps.set(this.pipelineSteps().map((step, index) => ({
      ...step,
      status: index === 0 ? 'running' : 'pending'
    })));

    const progress = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    progress.forEach((stepIndex, index) => {
      window.setTimeout(() => {
        this.pipelineSteps.set(this.pipelineSteps().map((step, stepPosition) => ({
          ...step,
          status: stepPosition < stepIndex ? 'completed' : stepPosition === stepIndex ? 'running' : 'pending'
        })));
      }, index * 240);
    });

    const incidentId = this.selectedIncident()?.id;
    if (!incidentId) {
      this.isLoading.set(false);
      this.errorMessage.set('Select an incident before analyzing.');
      return;
    }

    this.decisionApi.executeDecision({ engine: 'incident', incidentId }).subscribe({
      next: (result) => {
        this.response.set(result);
        this.isLoading.set(false);
        this.pipelineSteps.set(this.pipelineSteps().map((step) => ({ ...step, status: 'completed' })));
      },
      error: (error: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message);
        this.pipelineSteps.set(this.pipelineSteps().map((step) => ({ ...step, status: 'pending' })));
      }
    });
  }
}
