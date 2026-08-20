import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecisionEvidenceItem, DecisionResponse } from '../../../core/models/decision-response.model';
import { SecurityApiService } from '../../../core/services/security-api.service';
import { JiraTicketResponse, RemediationPlan, RemediationStatusResponse, RemediationVerificationResponse, SecurityFinding } from '../../../core/models/security-finding.model';

@Component({
  selector: 'app-security-analysis-panel',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <aside class="panel">
      <div class="panel-head">
        <div class="panel-title">Analysis Panel</div>
        <div class="panel-sub">Actionable context for selected finding</div>
      </div>

      @if (errorMsg()) {
        <div class="error-banner">{{ errorMsg() }}</div>
      }

      <div class="panel-content" [class.is-idle]="!finding()">
        @if (finding(); as selected) {
          <section class="panel-section">
            <h4>Security Finding</h4>
            <p class="finding-title">{{ selected.title }}</p>
            <p class="finding-desc">{{ selected.description }}</p>
            <div class="detail-row detail-row--compact"><span>Severity</span><strong>{{ selected.severity }}</strong></div>
            <div class="detail-row detail-row--compact"><span>Current Status</span><strong>{{ selected.status }}</strong></div>
            <div class="detail-row detail-row--stacked">
              <span>Executive Summary</span>
              <p class="placeholder-copy">{{ executiveSummaryText() }}</p>
            </div>
            <div class="detail-row detail-row--stacked">
              <span>Root Cause</span>
              <p class="placeholder-copy">{{ rootCauseText() }}</p>
            </div>
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
            <h4>Business Impact</h4>
            <p class="placeholder-copy">{{ businessImpactText() }}</p>
          </section>

          <section class="panel-section">
            <h4>Compliance Impact</h4>
            <div class="detail-row"><strong>{{ selected.complianceImpact }}</strong></div>
          </section>

          <section class="panel-section">
            <h4>Recommendation</h4>
            <p class="placeholder-copy">{{ recommendationText() }}</p>
            <div class="detail-row detail-row--compact"><span>Confidence</span><strong>{{ confidenceLabel() }}</strong></div>
            <div class="detail-row detail-row--compact"><span>Automation Available</span><strong>{{ automationLabel() }}</strong></div>
          </section>

          @if (remediationPlan(); as plan) {
            <section class="panel-section remediation-plan">
              <h4>AI Remediation Plan</h4>
              <div class="detail-row detail-row--stacked"><span>Summary</span><p class="placeholder-copy">{{ plan.summary }}</p></div>
              <div class="detail-row detail-row--stacked"><span>Root Cause</span><p class="placeholder-copy">{{ plan.rootCause }}</p></div>
              <div class="detail-row detail-row--stacked"><span>Business Impact</span><p class="placeholder-copy">{{ plan.businessImpact }}</p></div>
              <div class="detail-row detail-row--stacked">
                <span>Recommended Actions</span>
                <ol class="plan-steps">
                  @for (step of plan.remediationSteps; track step) { <li>{{ step }}</li> }
                </ol>
              </div>
              <div class="detail-row detail-row--stacked">
                <span>Recommended Owner</span>
                @if (plan.recommendedOwner; as owner) {
                  <strong>{{ owner.name || owner.team || owner.userId }}</strong>
                } @else {
                  <strong class="owner-unavailable">Owner recommendation unavailable — insufficient historical evidence.</strong>
                }
              </div>
              <div class="detail-row detail-row--stacked"><span>Why this owner?</span><p class="placeholder-copy">{{ plan.ownerReason }}</p></div>
              <div class="detail-row"><span>Estimated Effort</span><strong>{{ plan.estimatedEffort }}</strong></div>
              <div class="detail-row detail-row--stacked"><span>Risk if not resolved</span><p class="placeholder-copy">{{ plan.riskIfNotResolved }}</p></div>
              <div class="detail-row"><span>AI Confidence</span><strong>{{ plan.confidence }}%</strong></div>
              <div class="detail-row"><span>Generated</span><strong>{{ plan.generatedAt | date: 'medium' }}</strong></div>
              @if (jiraTicket(); as ticket) {
                <div class="jira-created">
                  <strong>✓ Jira Ticket Created</strong>
                  <a [href]="ticket.jiraUrl" target="_blank" rel="noopener">{{ ticket.jiraKey }}</a>
                  <span>Assigned to: {{ ticket.assigneeName || ticket.assignee || 'Unassigned' }}</span>
                  <a class="jira-link" [href]="ticket.jiraUrl" target="_blank" rel="noopener">Open in Jira</a>
                </div>
                @if (remediationStatus(); as status) {
                  <div class="remediation-status">
                    <strong>Remediation Status</strong>
                    <span>{{ status.jiraKey }}</span>
                    <span>Assigned to: {{ status.assignee || ticket.assigneeName || 'Unassigned' }}</span>
                    <span>Status: {{ status.remediationState.replaceAll('_', ' ') }}</span>
                    <span>Last updated: {{ status.lastUpdated | date: 'medium' }}</span>
                    <div class="status-timeline">
                      <span class="complete">✓ Finding detected</span>
                      <span class="complete">✓ AI analysis completed</span>
                      <span class="complete">✓ Remediation plan generated</span>
                      <span class="complete">✓ Jira ticket created</span>
                      <span [class.complete]="status.remediationState === 'IN_PROGRESS' || status.remediationState === 'BLOCKED' || status.remediationState === 'RESOLVED'">→ Remediation in progress</span>
                      <span [class.complete]="verification()">{{ verification() ? '✓ Risk verification completed' : '○ Risk verification pending' }}</span>
                      <span [class.complete]="verification()?.result === 'VERIFIED'">{{ verification()?.result === 'VERIFIED' ? '✓ Compliance restored' : '○ Compliance restored' }}</span>
                    </div>
                    <div class="status-actions">
                      <button mat-stroked-button class="secondary-action" type="button" [disabled]="statusLoading()" (click)="refreshStatus()">Refresh Status</button>
                      @if (status.remediationState === 'RESOLVED') {
                        <button mat-flat-button class="primary-action" type="button" [disabled]="verificationLoading()" (click)="verifyRemediation()">
                          {{ verificationLoading() ? 'Verifying...' : 'Verify Remediation' }}
                        </button>
                      }
                    </div>
                  </div>
                }
                @if (verification(); as verificationResult) {
                  <div class="verification-result" [class.not-verified]="verificationResult.result === 'NOT_VERIFIED'">
                    <strong>Remediation Verification</strong>
                    <span>{{ verificationResult.result === 'VERIFIED' ? '✓ REMEDIATION VERIFIED' : '⚠ REMEDIATION NOT VERIFIED' }}</span>
                    <span>{{ verificationResult.reason }}</span>
                    @for (item of verificationResult.evidence; track item) { <span>• {{ item }}</span> }
                    @if (verificationResult.previousRiskScore && verificationResult.currentRiskScore) {
                      <span>Risk Score {{ verificationResult.previousRiskScore }} → {{ verificationResult.currentRiskScore }}</span>
                    }
                  </div>
                }
              } @else if (jiraConfirmation()) {
                <div class="jira-confirmation">
                  <strong>Create a Jira remediation ticket for this finding?</strong>
                  <div class="jira-preview">
                    <span>Title: {{ plan.title }}</span>
                    <span>Priority: {{ jiraPriority(plan.severity) }}</span>
                    <span>Recommended owner: {{ plan.recommendedOwner?.name || plan.recommendedOwner?.team || 'Unassigned' }}</span>
                    <span>Remediation steps: {{ plan.remediationSteps.length }}</span>
                  </div>
                  <div class="jira-confirmation-actions">
                    <button mat-stroked-button class="secondary-action" type="button" (click)="cancelJiraCreation()">Cancel</button>
                    <button mat-flat-button class="primary-action" type="button" [disabled]="jiraLoading()" (click)="createJiraTicket()">
                      @if (jiraLoading()) { <mat-spinner diameter="16" /> Creating... } @else { Create Ticket }
                    </button>
                  </div>
                </div>
              } @else {
                <button mat-stroked-button class="secondary-action jira-action" type="button" (click)="requestJiraCreation()">
                  Create Jira Ticket
                </button>
              }
            </section>
          }

          <section class="panel-section">
            <h4>Supporting Knowledge</h4>
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
              <p class="placeholder-copy">
                Enterprise runbooks, vendor advisories and internal documentation will appear here after RAG integration.
              </p>
            }
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
              <button mat-stroked-button class="secondary-action" type="button" [disabled]="planLoading()" (click)="generateRemediationPlan()">
                @if (planLoading()) { <mat-spinner diameter="16" /> Generating... } @else { Generate Remediation Plan }
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
            <p>Select a security finding to view its details and generate AI recommendations.</p>
          </div>
        }
      </div>
    </aside>
  `,
  styles: `
    .panel {
      background: var(--app-card-bg);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius);
      padding: 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    .panel-content {
      flex: 1;
      min-height: 0;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .panel-content::-webkit-scrollbar {
      width: 0.45rem;
    }

    .panel-content::-webkit-scrollbar-thumb {
      background: var(--app-border);
      border-radius: 0.25rem;
    }

    .panel-content.is-idle {
      justify-content: center;
      align-items: stretch;
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
      border-top: 1px solid var(--app-border);
      padding-top: 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.42rem;
    }

    .panel-section:first-child {
      border-top: 0;
      padding-top: 0;
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
      padding: 0.16rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .detail-row:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .detail-row--compact {
      padding-top: 0.22rem;
    }

    .detail-row--stacked {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.28rem;
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
      border-left: 2px solid rgba(148, 163, 184, 0.35);
      padding: 0.35rem 0 0.35rem 0.5rem;
      background: transparent;
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

    .remediation-plan {
      border-top-color: var(--app-primary);
    }

    .plan-steps {
      margin: 0;
      padding-left: 1.2rem;
      color: var(--app-text-secondary);
      font-size: 0.79rem;
      line-height: 1.5;
    }

    .owner-unavailable {
      color: var(--app-text-muted) !important;
      text-align: left !important;
      font-weight: 500 !important;
    }

    .jira-action {
      margin-top: 0.2rem;
      border-color: rgba(14, 165, 233, 0.5) !important;
    }

    .jira-confirmation,
    .jira-created {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      padding: 0.65rem;
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-sm);
      background: var(--app-surface-strong);
      color: var(--app-text-secondary);
      font-size: 0.78rem;
    }

    .jira-confirmation strong,
    .jira-created strong {
      color: var(--app-text);
    }

    .jira-preview {
      display: grid;
      gap: 0.2rem;
      line-height: 1.35;
    }

    .jira-confirmation-actions {
      display: flex;
      gap: 0.45rem;
    }

    .jira-confirmation-actions button {
      flex: 1;
    }

    .jira-created a {
      color: var(--app-primary);
      font-weight: 700;
    }

    .jira-link {
      align-self: flex-start;
    }

    .idle-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.55rem;
      color: var(--app-text-muted);
      text-align: center;
      min-height: 100%;
      padding: 1rem;
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
  protected readonly remediationPlan = signal<RemediationPlan | null>(null);
  protected readonly planLoading = signal(false);
  protected readonly jiraLoading = signal(false);
  protected readonly jiraConfirmation = signal(false);
  protected readonly jiraTicket = signal<JiraTicketResponse | null>(null);
  protected readonly remediationStatus = signal<RemediationStatusResponse | null>(null);
  protected readonly statusLoading = signal(false);
  protected readonly verification = signal<RemediationVerificationResponse | null>(null);
  protected readonly verificationLoading = signal(false);
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
      this.remediationPlan.set(null);
      this.jiraConfirmation.set(false);
      this.jiraTicket.set(null);
      this.remediationStatus.set(null);
      this.verification.set(null);
      this.errorMsg.set(null);
      this.resetSimulation();
    });
  }

  protected generateRemediationPlan(): void {
    const selected = this.finding();
    if (!selected) return;

    this.planLoading.set(true);
    this.errorMsg.set(null);
    this.securityApiService.generateRemediationPlan(selected.id).subscribe({
      next: (plan) => {
        this.remediationPlan.set(plan);
        this.planLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMsg.set(error.message || 'Unable to generate remediation plan.');
        this.planLoading.set(false);
      }
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

  protected requestJiraCreation(): void {
    if (this.remediationPlan()) {
      this.jiraConfirmation.set(true);
      this.errorMsg.set(null);
    }
  }

  protected cancelJiraCreation(): void {
    this.jiraConfirmation.set(false);
  }

  protected createJiraTicket(): void {
    const selected = this.finding();
    if (!selected || !this.remediationPlan() || this.jiraLoading()) return;

    this.jiraLoading.set(true);
    this.errorMsg.set(null);
    this.securityApiService.createJiraTicket(selected.id).subscribe({
      next: (ticket) => {
        this.jiraTicket.set(ticket);
        this.jiraConfirmation.set(false);
        this.jiraLoading.set(false);
        this.refreshStatus();
      },
      error: (error: Error) => {
        this.errorMsg.set(error.message || 'Unable to create Jira ticket.');
        this.jiraLoading.set(false);
      }
    });
  }

  protected refreshStatus(): void {
    const selected = this.finding();
    if (!selected || this.statusLoading()) return;
    this.statusLoading.set(true);
    this.securityApiService.getRemediationStatus(selected.id).subscribe({
      next: (status) => { this.remediationStatus.set(status); this.statusLoading.set(false); },
      error: (error: Error) => { this.errorMsg.set(error.message || 'Unable to load Jira status.'); this.statusLoading.set(false); }
    });
  }

  protected verifyRemediation(): void {
    const selected = this.finding();
    if (!selected || this.verificationLoading() || this.remediationStatus()?.remediationState !== 'RESOLVED') return;
    this.verificationLoading.set(true);
    this.errorMsg.set(null);
    this.securityApiService.verifyRemediation(selected.id).subscribe({
      next: (result) => { this.verification.set(result); this.verificationLoading.set(false); },
      error: (error: Error) => { this.errorMsg.set(error.message || 'Unable to verify remediation.'); this.verificationLoading.set(false); }
    });
  }

  protected jiraPriority(severity: string): string {
    if (severity.toLowerCase() === 'critical') return 'Highest';
    if (severity.toLowerCase() === 'high') return 'High';
    if (severity.toLowerCase() === 'low') return 'Low';
    return 'Medium';
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
