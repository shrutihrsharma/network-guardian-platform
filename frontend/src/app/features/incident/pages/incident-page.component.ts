import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { DecisionApiService } from '../../../core/services/decision-api.service';
import { DecisionResponse } from '../../../core/models/decision-response.model';
import { IncidentSummary } from '../../../core/models/incident-summary.model';
import { IncidentQueueComponent } from '../components/incident-queue.component';

@Component({
  selector: 'app-incident-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    IncidentQueueComponent
  ],
  template: `
    <section class="incident-page">
      <app-page-header
        title="Incidents"
        description="Enterprise incident operations with AI-assisted analysis and explainable recommendations."
      />

      <app-incident-queue
        [incidents]="incidents()"
        [selectedIncident]="drawerOpen() ? selectedIncident() : null"
        [aiStatuses]="aiStatuses()"
        [affectedDeviceCounts]="affectedDeviceCounts()"
        [disabled]="false"
        (incidentSelected)="openAnalysisDrawer($event)"
      />

      @if (errorMessage()) {
        <div class="error-banner">
          <span>{{ errorMessage() }}</span>
          <button type="button" (click)="retryCurrentAnalysis()">Retry</button>
        </div>
      }

      @if (drawerOpen() && selectedIncident(); as selected) {
        <aside class="analysis-drawer" aria-label="Incident analysis drawer">
          <header class="drawer-header">
            <div>
              <h3>Analysis Workspace</h3>
              <p>{{ selected.id }}</p>
            </div>
            <button type="button" class="close-button" (click)="closeDrawer()" aria-label="Close analysis drawer">Close</button>
          </header>

          <section class="drawer-section">
            <h4>Incident Summary</h4>
            <div class="detail-row"><span>Incident ID</span><strong>{{ selected.id }}</strong></div>
            <div class="detail-row"><span>Severity</span><strong [class.is-critical]="selected.severity.toLowerCase() === 'critical'">{{ selected.severity || 'Unknown' }}</strong></div>
            <div class="detail-row"><span>Status</span><strong>{{ selected.status || 'Unknown' }}</strong></div>
            <div class="detail-row"><span>Business Service</span><strong>{{ selected.businessService || 'No data available' }}</strong></div>
            <div class="detail-row"><span>Primary Device</span><strong>{{ selected.device || 'No data available' }}</strong></div>
            <div class="detail-row"><span>Created Time</span><strong>{{ selected.createdAt || 'No data available' }}</strong></div>
          </section>

          <section class="drawer-section">
            <h4>Affected Devices</h4>
            <ul class="detail-list">
              @for (device of affectedDevicesFor(selected); track device) {
                <li>{{ device }}</li>
              }
            </ul>
            <div class="detail-row"><span>Blast Radius</span><strong>{{ blastRadiusFor(selected) }}</strong></div>
            <div class="detail-row"><span>Number of affected devices</span><strong>{{ affectedDeviceCounts()[selected.id] || 0 }}</strong></div>
          </section>

          <section class="drawer-section">
            <h4>AI Root Cause</h4>
            <div class="detail-row"><span>Root Cause</span><strong>{{ rootCause() }}</strong></div>
            <div class="detail-row"><span>Confidence</span><strong>{{ confidenceLabel() }}</strong></div>
            <div class="detail-block">{{ reasoningLabel() }}</div>
          </section>

          <section class="drawer-section">
            <h4>Evidence</h4>
            <ul class="detail-list">
              @for (item of evidenceList(); track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </section>

          <section class="drawer-section">
            <h4>Recommendation</h4>
            <div class="detail-block">{{ recommendationLabel() }}</div>
            <div class="detail-row"><span>Automation Available</span><strong>{{ automationAvailable() }}</strong></div>
          </section>

          <section class="drawer-section">
            <h4>Supporting Knowledge</h4>
            <p class="supporting-note">
              Knowledge from enterprise runbooks and vendor documentation will appear here after RAG integration.
            </p>
          </section>

          <section class="drawer-section drawer-section--actions">
            <h4>Actions</h4>
            <div class="action-row">
              <button type="button" class="action-button" [disabled]="isLoading() || simulationRunning()" (click)="simulateApplyRecommendation()">
                Apply Recommendation
              </button>
              <button type="button" class="action-button action-button--ghost" disabled>
                Export Report
              </button>
              <button type="button" class="action-button action-button--ghost" disabled>
                Generate Runbook
              </button>
            </div>

            @if (simulationVisible()) {
              <div class="simulation-panel">
                @for (step of simulationSteps; track step; let idx = $index) {
                  <div class="simulation-step" [class.is-complete]="idx <= simulationStepIndex()">
                    <span class="step-icon">✓</span>
                    <span>{{ step }}</span>
                  </div>
                }
                @if (simulationComplete()) {
                  <div class="simulation-done">Simulation completed successfully.</div>
                }
              </div>
            }
          </section>
        </aside>
      }
    </section>
  `,
  styles: `
    .incident-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
      min-height: calc(100vh - 12rem);
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
      color: #111827;
      font-weight: 700;
      cursor: pointer;
    }

    .analysis-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(480px, 100vw);
      background: #0d1420;
      border-left: 1px solid var(--app-border);
      box-shadow: var(--app-shadow);
      z-index: 45;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.7rem;
      padding-bottom: 0.7rem;
      border-bottom: 1px solid var(--app-border);
    }

    .drawer-header h3 {
      margin: 0;
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 700;
    }

    .drawer-header p {
      margin: 0.2rem 0 0;
      color: var(--app-text-muted);
      font-size: 0.8rem;
    }

    .close-button {
      border: 1px solid var(--app-border);
      background: transparent;
      color: var(--app-text-secondary);
      border-radius: 999px;
      padding: 0.35rem 0.75rem;
      cursor: pointer;
    }

    .drawer-section {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 0.85rem;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .drawer-section h4 {
      margin: 0;
      color: var(--app-text);
      font-size: 0.9rem;
      font-weight: 700;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
      padding: 0.32rem 0;
      border-bottom: 1px solid var(--app-border);
    }

    .detail-row:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .detail-row span {
      color: var(--app-text-muted);
      font-size: 0.82rem;
    }

    .detail-row strong {
      color: var(--app-text);
      font-size: 0.84rem;
      text-align: right;
    }

    .is-critical {
      color: var(--app-danger);
    }

    .detail-block {
      margin: 0;
      padding: 0.55rem;
      border-radius: 0.6rem;
      border: 1px solid var(--app-border);
      color: var(--app-text-secondary);
      font-size: 0.84rem;
      line-height: 1.5;
      background: rgba(255, 255, 255, 0.01);
    }

    .detail-list {
      margin: 0;
      padding-left: 1rem;
      color: var(--app-text-secondary);
      font-size: 0.84rem;
      display: flex;
      flex-direction: column;
      gap: 0.32rem;
    }

    .supporting-note {
      margin: 0;
      color: var(--app-text-secondary);
      font-size: 0.84rem;
      line-height: 1.5;
    }

    .drawer-section--actions {
      margin-bottom: 1rem;
    }

    .action-row {
      display: flex;
      gap: 0.55rem;
      flex-wrap: wrap;
    }

    .action-button {
      border: 0;
      border-radius: 999px;
      padding: 0.45rem 0.85rem;
      background: var(--app-primary);
      color: #111827;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }

    .action-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .action-button--ghost {
      background: transparent;
      border: 1px solid var(--app-border);
      color: var(--app-text-secondary);
    }

    .simulation-panel {
      margin-top: 0.45rem;
      border: 1px solid var(--app-border);
      border-radius: 0.7rem;
      padding: 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      background: rgba(34, 197, 94, 0.06);
    }

    .simulation-step {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--app-text-muted);
      font-size: 0.82rem;
    }

    .simulation-step.is-complete {
      color: #86efac;
    }

    .step-icon {
      font-size: 0.9rem;
      line-height: 1;
    }

    .simulation-done {
      color: var(--app-success);
      font-size: 0.84rem;
      font-weight: 700;
      padding-top: 0.2rem;
    }

    @media (max-width: 960px) {
      .analysis-drawer {
        width: 100vw;
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
  readonly drawerOpen = signal(false);
  readonly aiStatuses = signal<Record<string, string>>({});
  readonly affectedDeviceCounts = signal<Record<string, number>>({});
  readonly simulationVisible = signal(false);
  readonly simulationRunning = signal(false);
  readonly simulationComplete = signal(false);
  readonly simulationStepIndex = signal(-1);

  readonly simulationSteps = [
    'Creating Change Request',
    'Updating Incident',
    'Assigning Network Team',
    'Recording AI Decision'
  ];

  constructor(private readonly decisionApi: DecisionApiService) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.decisionApi.getIncidents().subscribe({
      next: (incidents) => {
        this.incidents.set(incidents);
        const counts: Record<string, number> = {};
        incidents.forEach((incident) => {
          counts[incident.id] = this.seedAffectedCount(incident);
        });
        this.affectedDeviceCounts.set(counts);
      },
      error: () => {
        this.errorMessage.set('Unable to load incident queue.');
      }
    });
  }

  openAnalysisDrawer(incident: IncidentSummary): void {
    this.drawerOpen.set(true);
    this.selectedIncident.set(incident);
    this.errorMessage.set(null);
    this.simulationVisible.set(false);
    this.simulationRunning.set(false);
    this.simulationComplete.set(false);
    this.simulationStepIndex.set(-1);
    this.analyzeIncident(incident.id);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  retryCurrentAnalysis(): void {
    const incidentId = this.selectedIncident()?.id;
    if (!incidentId) {
      this.errorMessage.set('Select an incident before analyzing.');
      return;
    }

    this.analyzeIncident(incidentId);
  }

  simulateApplyRecommendation(): void {
    this.simulationVisible.set(true);
    this.simulationRunning.set(true);
    this.simulationComplete.set(false);
    this.simulationStepIndex.set(-1);

    this.simulationSteps.forEach((_, index) => {
      window.setTimeout(() => {
        this.simulationStepIndex.set(index);

        if (index === this.simulationSteps.length - 1) {
          this.simulationRunning.set(false);
          this.simulationComplete.set(true);
        }
      }, index * 500);
    });
  }

  confidenceLabel(): string {
    const confidence = this.response()?.confidence;
    return typeof confidence === 'number' ? `${confidence}%` : 'No data available';
  }

  recommendationLabel(): string {
    return this.response()?.recommendation || 'No data available';
  }

  reasoningLabel(): string {
    return this.response()?.reasoning || 'No data available';
  }

  rootCause(): string {
    const reasoning = this.response()?.reasoning;
    if (!reasoning) {
      return 'No data available';
    }

    return reasoning.split(/[.|\n]/).map((line) => line.trim()).find((line) => line.length > 0) || 'No data available';
  }

  evidenceList(): string[] {
    const evidence = this.response()?.evidence;
    if (evidence?.length) {
      return evidence.map((item) => item.title || item.summary).filter((item) => !!item);
    }

    return [
      'Recent configuration change',
      'Historical incident similarity',
      'Interface errors',
      'CPU spike'
    ];
  }

  automationAvailable(): string {
    const result = this.response();
    if (!result) {
      return 'NO';
    }

    return result.approvalRequired ? 'NO' : 'YES';
  }

  blastRadiusFor(incident: IncidentSummary): string {
    const severity = incident.severity.toLowerCase();
    if (severity === 'critical') {
      return 'High';
    }
    if (severity === 'high') {
      return 'Medium';
    }
    return 'Low';
  }

  affectedDevicesFor(incident: IncidentSummary): string[] {
    const count = this.affectedDeviceCounts()[incident.id] || 0;
    const baseName = incident.device || 'core-device';
    const generated = Array.from({ length: Math.min(count, 5) }, (_, idx) => `${baseName}-node-${idx + 1}`);

    return generated.length ? generated : ['No data available'];
  }

  private analyzeIncident(incidentId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.response.set(null);
    this.aiStatuses.set({ ...this.aiStatuses(), [incidentId]: 'Analyzing' });

    this.decisionApi.executeDecision({ engine: 'incident', incidentId }).subscribe({
      next: (result) => {
        this.response.set(result);
        this.isLoading.set(false);
        this.aiStatuses.set({ ...this.aiStatuses(), [incidentId]: 'Ready' });
      },
      error: (error: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message);
        this.aiStatuses.set({ ...this.aiStatuses(), [incidentId]: 'Failed' });
      }
    });
  }

  private seedAffectedCount(incident: IncidentSummary): number {
    const severity = incident.severity.toLowerCase();
    if (severity === 'critical') {
      return 14;
    }
    if (severity === 'high') {
      return 8;
    }
    if (severity === 'medium') {
      return 5;
    }
    return 3;
  }
}
