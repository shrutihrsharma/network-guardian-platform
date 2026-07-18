import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DeviceContextStore } from '../services/device-context.store';
import { SectionCardComponent } from '../../../shared/components/section-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { DecisionApiService } from '../../../core/services/decision-api.service';
import { IncidentSummary } from '../../../core/models/incident-summary.model';
import { IncidentQueueComponent } from '../../incident/components/incident-queue.component';
import { DecisionResponse } from '../../../core/models/decision-response.model';
import { AiRecommendationPanelComponent } from '../../../shared/components/ai-recommendation-panel.component';

@Component({
  selector: 'app-device-incidents-tab',
  standalone: true,
  imports: [SectionCardComponent, EmptyStateComponent, IncidentQueueComponent, AiRecommendationPanelComponent],
  template: `
    @if (device(); as currentDevice) {
      <app-section-card
        title="Incident Operations"
        description="Open incidents for the selected device with in-tab AI analysis."
      >
        <div class="entry-content">
          @if (loadError()) {
            <p class="error-text">{{ loadError() }}</p>
          }

          @if (isLoadingIncidents()) {
            <p>Loading open incidents for {{ currentDevice.hostname }}...</p>
          } @else if (openIncidents().length) {
            <app-incident-queue
              [incidents]="openIncidents()"
              [selectedIncident]="selectedIncident()"
              [aiStatuses]="aiStatuses()"
              [affectedDeviceCounts]="affectedDeviceCounts()"
              [disabled]="analysisLoading()"
              (incidentSelected)="analyzeIncident($event)"
            />

            @if (analysisError()) {
              <p class="error-text">{{ analysisError() }}</p>
            }

            @if (analysisLoading()) {
              <p>Analyzing {{ selectedIncident()?.id }}...</p>
            }

            @if (response()) {
              <div class="analysis-result">
                <h4>Analysis Result: {{ selectedIncident()?.id }}</h4>
                <div class="analysis-summary">
                  <span>Root Cause</span>
                  <strong>{{ rootCause() }}</strong>
                </div>
                <app-ai-recommendation-panel [response]="response()" />
              </div>
            }
          } @else {
            <p>No open incidents are currently linked to {{ currentDevice.hostname }}.</p>
          }
        </div>
      </app-section-card>
    } @else {
      <app-empty-state
        title="No device selected"
        description="Choose a device to open its incident workspace entry point."
        icon="warning"
      />
    }
  `,
  styles: `
    .entry-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    p {
      margin: 0;
      line-height: 1.6;
      color: var(--app-text-muted);
    }

    .analysis-result {
      border: 1px solid var(--app-border);
      border-radius: 0.8rem;
      padding: 0.85rem;
      background: var(--app-surface);
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }

    .analysis-result h4 {
      margin: 0;
      color: var(--app-text);
      font-size: 0.92rem;
    }

    .analysis-summary {
      border: 1px solid var(--app-border);
      border-radius: 0.65rem;
      padding: 0.55rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      background: var(--app-card-bg);
    }

    .analysis-summary span {
      color: var(--app-text-muted);
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .analysis-summary strong {
      color: var(--app-text);
      font-weight: 600;
      font-size: 0.86rem;
      line-height: 1.45;
    }

    .error-text {
      color: var(--app-danger);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceIncidentsTabComponent {
  private readonly contextStore = inject(DeviceContextStore);
  private readonly decisionApi = inject(DecisionApiService);

  protected readonly isLoadingIncidents = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly allIncidents = signal<IncidentSummary[]>([]);
  protected readonly analysisLoading = signal(false);
  protected readonly analysisError = signal<string | null>(null);
  protected readonly selectedIncident = signal<IncidentSummary | null>(null);
  protected readonly response = signal<DecisionResponse | null>(null);
  protected readonly aiStatuses = signal<Record<string, string>>({});
  protected readonly affectedDeviceCounts = signal<Record<string, number>>({});

  protected readonly device = computed(() => this.contextStore.device());

  protected readonly openIncidents = computed(() => {
    const currentDevice = this.device();
    if (!currentDevice) {
      return [];
    }

    const hostname = this.normalize(currentDevice.hostname);
    const deviceName = this.normalize(currentDevice.deviceName);

    return this.allIncidents().filter((incident) => {
      const incidentDevice = this.normalize(incident.device);
      const status = this.normalize(incident.status);
      const isSameDevice = incidentDevice === hostname || incidentDevice === deviceName;
      const isOpen = status !== 'resolved' && status !== 'closed';
      return isSameDevice && isOpen;
    });
  });

  constructor() {
    effect(() => {
      const currentDevice = this.device();
      if (!currentDevice) {
        this.allIncidents.set([]);
        this.selectedIncident.set(null);
        this.response.set(null);
        return;
      }

      this.fetchIncidents();
    });
  }

  protected analyzeIncident(incident: IncidentSummary): void {
    this.selectedIncident.set(incident);
    this.analysisError.set(null);
    this.response.set(null);
    this.analysisLoading.set(true);
    this.aiStatuses.set({ ...this.aiStatuses(), [incident.id]: 'Analyzing' });

    this.decisionApi.executeDecision({ engine: 'incident', incidentId: incident.id }).subscribe({
      next: (result) => {
        this.response.set(result);
        this.analysisLoading.set(false);
        this.aiStatuses.set({ ...this.aiStatuses(), [incident.id]: 'Ready' });
      },
      error: (error: Error) => {
        this.analysisLoading.set(false);
        this.analysisError.set(error.message);
        this.aiStatuses.set({ ...this.aiStatuses(), [incident.id]: 'Failed' });
      }
    });
  }

  protected rootCause(): string {
    const reasoning = this.response()?.reasoning;
    if (!reasoning) {
      return 'No data available';
    }

    return reasoning.split(/[.|\n]/).map((line) => line.trim()).find((line) => line.length > 0) || 'No data available';
  }

  private fetchIncidents(): void {
    this.isLoadingIncidents.set(true);
    this.loadError.set(null);

    this.decisionApi.getIncidents().subscribe({
      next: (incidents) => {
        this.allIncidents.set(incidents);
        this.isLoadingIncidents.set(false);
        this.syncTableMetadata();
      },
      error: () => {
        this.isLoadingIncidents.set(false);
        this.loadError.set('Unable to load incidents for this device.');
      }
    });
  }

  private syncTableMetadata(): void {
    const counts: Record<string, number> = {};
    const statuses: Record<string, string> = {};

    this.openIncidents().forEach((incident) => {
      counts[incident.id] = this.seedAffectedCount(incident);
      statuses[incident.id] = this.aiStatuses()[incident.id] || 'Pending';
    });

    this.affectedDeviceCounts.set(counts);
    this.aiStatuses.set(statuses);
  }

  private seedAffectedCount(incident: IncidentSummary): number {
    const severity = this.normalize(incident.severity);
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

  private normalize(value: string | null | undefined): string {
    return (value || '').trim().toLowerCase();
  }
}
