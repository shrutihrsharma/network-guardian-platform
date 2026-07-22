import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecisionEvidenceItem, DecisionResponse } from '../../../core/models/decision-response.model';
import { SecurityApiService } from '../../../core/services/security-api.service';
import { SecurityFinding } from '../../../core/models/security-finding.model';

@Component({
  selector: 'app-security-analysis-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <aside class="panel">
      <div class="panel-head">
        <div class="panel-title">Analysis Panel</div>
        <div class="panel-sub">Actionable context for selected finding</div>
      </div>

      @if (errorMsg()) {
        <div class="error-banner">{{ errorMsg() }}</div>
      }

      @if (finding(); as selected) {
        <section class="panel-section">
          <h4>Security Finding</h4>
          <p class="finding-title">{{ selected.title }}</p>
          <p class="finding-desc">{{ selected.description }}</p>
        </section>

        <section class="panel-section">
          <h4>Device</h4>
          <div class="detail-row"><span>Name</span><strong>{{ selected.deviceName }}</strong></div>
          <div class="detail-row"><span>Vendor</span><strong>{{ selected.vendor }}</strong></div>
          <div class="detail-row"><span>Region</span><strong>{{ selected.region }}</strong></div>
          <div class="detail-row"><span>Business Service</span><strong>{{ selected.businessService }}</strong></div>
        </section>

        <section class="panel-section">
          <h4>Category</h4>
          <div class="detail-row"><strong>{{ selected.category.replaceAll('_', ' ') }}</strong></div>
        </section>

        <section class="panel-section">
          <h4>Severity</h4>
          <div class="detail-row"><strong>{{ selected.severity }}</strong></div>
        </section>

        <section class="panel-section">
          <h4>Business Impact</h4>
          <p class="placeholder-copy">{{ businessImpactText() }}</p>
        </section>

        <section class="panel-section">
          <h4>Compliance Impact</h4>
          <div class="detail-row"><strong>{{ selected.complianceImpact }}</strong></div>
        </section>

        <section class="panel-section">
          <h4>Current Status</h4>
          <div class="detail-row"><strong>{{ selected.status }}</strong></div>
        </section>

        <section class="panel-section">
          <h4>Executive Summary</h4>
          <p class="placeholder-copy">{{ executiveSummaryText() }}</p>
        </section>

        <section class="panel-section">
          <h4>Root Cause</h4>
          <p class="placeholder-copy">{{ rootCauseText() }}</p>
        </section>

        <section class="panel-section">
          <h4>Supporting Evidence</h4>
          @if (supportingEvidence().length) {
            <div class="evidence-list">
              @for (item of supportingEvidence(); track item.summary + item.title) {
                <div class="evidence-item">
                  <div class="evidence-title">{{ item.title }}</div>
                  <div class="evidence-summary">{{ item.summary }}</div>
                </div>
              }
            </div>
          } @else {
            <p class="placeholder-copy">Supporting evidence will appear here after analysis.</p>
          }
        </section>

        <section class="panel-section">
          <h4>Recommendation</h4>
          <p class="placeholder-copy">{{ recommendationText() }}</p>
          <div class="detail-row detail-row--compact"><span>Confidence</span><strong>{{ confidenceLabel() }}</strong></div>
          <div class="detail-row detail-row--compact"><span>Automation Available</span><strong>{{ automationLabel() }}</strong></div>
        </section>

        <section class="panel-section">
          <h4>Supporting Knowledge</h4>
          <p class="placeholder-copy">
            Enterprise runbooks, vendor advisories and internal documentation will appear here after RAG integration.
          </p>
        </section>

        <section class="panel-section">
          <h4>Actions</h4>
          <div class="action-grid">
            <button mat-flat-button class="primary-action" type="button" [disabled]="loading()" (click)="analyze()">
              @if (loading()) {
                <mat-spinner diameter="16" />
                Analyzing...
              } @else {
                Analyze
              }
            </button>
            <button
              mat-stroked-button
              class="secondary-action"
              type="button"
              [disabled]="simulationRunning() || !result()"
              (click)="simulateApplyRecommendation()"
            >
              Apply Recommendation
            </button>
            <button mat-stroked-button class="secondary-action" type="button" disabled>Export Report</button>
            <button mat-stroked-button class="secondary-action" type="button" disabled>Generate Change Request</button>
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
      } @else {
        <div class="idle-state">
          <mat-icon>policy</mat-icon>
          <p>Select a finding from the table to view analysis details and operational actions.</p>
        </div>
      }
    </aside>
  `,
  styles: `
    .panel {
      background: var(--app-card-bg);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 44rem;
      overflow-y: auto;
    }

    .panel::-webkit-scrollbar {
      width: 0.45rem;
    }

    .panel::-webkit-scrollbar-thumb {
      background: var(--app-border);
      border-radius: 0.25rem;
    }

    .panel-head {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .panel-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .panel-sub {
      font-size: 0.76rem;
      color: var(--app-text-muted);
    }

    .panel-section {
      border: 1px solid var(--app-border);
      border-radius: 0.65rem;
      padding: 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .panel-section h4 {
      margin: 0;
      color: var(--app-text);
      font-size: 0.82rem;
      font-weight: 700;
    }

    .finding-title {
      margin: 0;
      color: var(--app-text);
      font-size: 0.83rem;
      font-weight: 600;
      line-height: 1.35;
    }

    .finding-desc,
    .placeholder-copy {
      margin: 0;
      color: var(--app-text-secondary);
      font-size: 0.79rem;
      line-height: 1.45;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 0.55rem;
      padding: 0.22rem 0;
      border-bottom: 1px solid var(--app-border);
    }

    .detail-row:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .detail-row--compact {
      padding-top: 0.3rem;
    }

    .detail-row span {
      color: var(--app-text-muted);
      font-size: 0.76rem;
    }

    .detail-row strong {
      color: var(--app-text);
      font-size: 0.79rem;
      text-align: right;
    }

    .action-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.45rem;
    }

    .primary-action {
      background: var(--app-primary) !important;
      color: #080c14 !important;
      font-weight: 600;
    }

    .secondary-action {
      border-color: var(--app-border) !important;
      color: var(--app-text-secondary) !important;
      justify-content: flex-start;
    }

    .evidence-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .evidence-item {
      border: 1px solid var(--app-border);
      border-radius: 0.55rem;
      padding: 0.55rem;
      background: rgba(255, 255, 255, 0.02);
    }

    .evidence-title {
      color: var(--app-text);
      font-size: 0.76rem;
      font-weight: 600;
      margin-bottom: 0.18rem;
    }

    .evidence-summary {
      color: var(--app-text-secondary);
      font-size: 0.77rem;
      line-height: 1.45;
    }

    .simulation-panel {
      margin-top: 0.2rem;
      border: 1px solid var(--app-border);
      border-radius: 0.55rem;
      padding: 0.55rem;
      display: flex;
      flex-direction: column;
      gap: 0.38rem;
      background: rgba(34, 197, 94, 0.06);
    }

    .simulation-step {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--app-text-muted);
      font-size: 0.78rem;
    }

    .simulation-step.is-complete {
      color: #86efac;
    }

    .step-icon {
      font-size: 0.86rem;
      line-height: 1;
    }

    .simulation-done {
      color: var(--app-success);
      font-size: 0.8rem;
      font-weight: 700;
      padding-top: 0.1rem;
    }

    .error-banner {
      padding: 0.75rem 1rem;
      border-radius: var(--app-radius-sm);
      background: var(--app-danger-soft);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--app-danger);
      font-size: 0.85rem;
    }

    .idle-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.55rem;
      color: var(--app-text-muted);
      text-align: center;
      padding: 1.75rem 1rem;
    }

    .idle-state mat-icon {
      font-size: 1.45rem;
      width: 1.45rem;
      height: 1.45rem;
      opacity: 0.55;
    }

    .idle-state p {
      margin: 0;
      font-size: 0.84rem;
      line-height: 1.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityAnalysisPanelComponent {
  readonly finding = input<SecurityFinding | null>(null);

  protected readonly loading = signal(false);
  protected readonly result = signal<DecisionResponse | null>(null);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly simulationVisible = signal(false);
  protected readonly simulationRunning = signal(false);
  protected readonly simulationComplete = signal(false);
  protected readonly simulationStepIndex = signal(-1);

  protected readonly simulationSteps = [
    'Creating Change Request',
    'Assigning Network Team',
    'Updating Security Finding',
    'Recording AI Decision'
  ];

  protected readonly supportingEvidence = computed<DecisionEvidenceItem[]>(() => this.result()?.evidence ?? []);
  protected readonly businessImpactText = computed(() =>
    this.result()?.businessImpact ||
    (this.finding()
      ? `Potential disruption risk for ${this.finding()!.businessService} operations due to unresolved posture gaps.`
      : 'No data available.')
  );
  protected readonly executiveSummaryText = computed(() => this.result()?.summary || 'Run Analyze to generate an executive summary.');
  protected readonly rootCauseText = computed(() => this.result()?.rootCause || this.result()?.reasoning || 'Run Analyze to generate a root cause assessment.');
  protected readonly recommendationText = computed(() => this.result()?.recommendation || 'Run Analyze to generate a recommendation.');
  protected readonly confidenceLabel = computed(() => {
    const confidence = this.result()?.confidence;
    return typeof confidence === 'number' ? `${confidence}%` : 'Not analyzed';
  });
  protected readonly automationLabel = computed(() => this.result()?.automationAvailable || 'Not analyzed');

  constructor(private readonly securityApiService: SecurityApiService) {
    effect(() => {
      this.finding();
      this.result.set(null);
      this.errorMsg.set(null);
      this.resetSimulation();
    });
  }

  protected analyze(): void {
    const selected = this.finding();
    if (!selected) {
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);
    this.result.set(null);
    this.resetSimulation();

    this.securityApiService.analyzeFinding(selected.id).subscribe({
      next: (response) => {
        this.result.set(response);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.errorMsg.set(error.message);
        this.loading.set(false);
      }
    });
  }

  protected simulateApplyRecommendation(): void {
    if (!this.result() || this.simulationRunning()) {
      return;
    }

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
      }, (index + 1) * 450);
    });
  }

  private resetSimulation(): void {
    this.simulationVisible.set(false);
    this.simulationRunning.set(false);
    this.simulationComplete.set(false);
    this.simulationStepIndex.set(-1);
  }
}
