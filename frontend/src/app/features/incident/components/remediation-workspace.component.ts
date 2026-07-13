import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IncidentSummary } from '../../../core/models/incident-summary.model';

@Component({
  selector: 'app-remediation-workspace',
  standalone: true,
  template: `
    <section class="remediation-card">
      <div class="remediation-card__header">
        <h3>Choose Remediation Strategy</h3>
        <p>Guide the next operational step with either automated or manual remediation.</p>
      </div>

      <div class="remediation-grid">
        <div class="remediation-panel">
          <h4>Automatic Remediation</h4>
          <p>Allow AI to execute the recommended remediation automatically after confirmation.</p>
          <div class="detail-row"><span>Estimated execution time</span><strong>4-6 mins</strong></div>
          <div class="detail-row"><span>Risk level</span><strong>Medium</strong></div>
          <div class="detail-row"><span>Systems impacted</span><strong>{{ incident()?.device }}</strong></div>
          <button type="button" class="action-button" (click)="automaticSelected.emit()">Execute Automatic Remediation</button>
        </div>

        <div class="remediation-panel">
          <h4>Guided Manual Remediation</h4>
          <p>Work through the runbook as a deliberate checklist.</p>
          <div class="checklist-item">
            <input type="checkbox" />
            <div>
              <strong>Verify certificate expiry</strong>
              <div class="checklist-item__meta">Command: show crypto pki certificates</div>
              <div class="checklist-item__meta">Expected: Certificate expires in less than 2 days.</div>
            </div>
          </div>
          <div class="checklist-item">
            <input type="checkbox" />
            <div>
              <strong>Restart routing process</strong>
              <div class="checklist-item__meta">Command: clear ip route *</div>
              <div class="checklist-item__meta">Expected: Routing adjacency restored.</div>
            </div>
          </div>
          <button type="button" class="action-button action-button--secondary">Mark Incident Resolved</button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .remediation-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .remediation-card__header h3 {
      margin: 0 0 0.25rem;
      color: #e0e7ff;
      font-size: 1.02rem;
      font-weight: 700;
    }

    .remediation-card__header p {
      margin: 0;
      color: #cbd5e1;
      font-size: 0.9rem;
    }

    .remediation-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .remediation-panel {
      border: 1px solid var(--app-border);
      border-radius: 0.9rem;
      padding: 0.9rem;
      background: rgba(255,255,255,0.02);
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }

    .remediation-panel h4 {
      margin: 0;
      color: #e0e7ff;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .remediation-panel p {
      margin: 0;
      color: #cbd5e1;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
      color: #cbd5e1;
      font-size: 0.9rem;
    }

    .detail-row strong {
      color: #e0e7ff;
      text-align: right;
    }

    .action-button {
      margin-top: 0.2rem;
      border: 0;
      border-radius: 999px;
      padding: 0.55rem 0.85rem;
      background: var(--app-primary);
      color: white;
      cursor: pointer;
      align-self: flex-start;
    }

    .action-button--secondary {
      background: transparent;
      border: 1px solid var(--app-border);
      color: #e0e7ff;
    }

    .checklist-item {
      display: flex;
      gap: 0.7rem;
      align-items: flex-start;
      border: 1px solid var(--app-border);
      border-radius: 0.8rem;
      padding: 0.65rem;
      background: rgba(255,255,255,0.02);
      color: #cbd5e1;
    }

    .checklist-item__meta {
      color: #94a3b8;
      font-size: 0.8rem;
      margin-top: 0.2rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemediationWorkspaceComponent {
  readonly incident = input<IncidentSummary | null>(null);
  readonly automaticSelected = output<void>();
}
