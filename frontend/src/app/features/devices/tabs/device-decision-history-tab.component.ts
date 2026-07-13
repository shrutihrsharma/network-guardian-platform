import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionCardComponent } from '../../../shared/components/section-card.component';

@Component({
  selector: 'app-device-decision-history-tab',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card title="Decision Timeline" description="Reusable timeline container for decision audit history.">
      <div class="timeline-placeholder">
        <div class="timeline-node">
          <h4>Decision Timestamp</h4>
          <p>AI Provider, Recommendation, Confidence, Execution Status, Audit Reference</p>
        </div>
        <div class="timeline-node">
          <h4>Decision Timestamp</h4>
          <p>AI Provider, Recommendation, Confidence, Execution Status, Audit Reference</p>
        </div>
        <div class="timeline-node">
          <h4>Decision Timestamp</h4>
          <p>AI Provider, Recommendation, Confidence, Execution Status, Audit Reference</p>
        </div>
      </div>
    </app-section-card>
  `,
  styles: `
    .timeline-placeholder {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      padding-left: 0.9rem;
      border-left: 2px dashed var(--app-border);
    }

    .timeline-node {
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 0.8rem;
      padding: 0.8rem;
      background: rgba(30, 41, 59, 0.28);
    }

    h4 {
      margin: 0 0 0.3rem;
      color: var(--app-text);
      font-size: 0.92rem;
    }

    p {
      margin: 0;
      color: var(--app-text-muted);
      line-height: 1.55;
      font-size: 0.88rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceDecisionHistoryTabComponent {}
