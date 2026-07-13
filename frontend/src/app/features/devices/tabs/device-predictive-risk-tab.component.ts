import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionCardComponent } from '../../../shared/components/section-card.component';

@Component({
  selector: 'app-device-predictive-risk-tab',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <section class="widget-grid">
      <app-section-card title="Overall Risk Score" description="Composite risk score for this device.">
        <p>AI-backed risk scoring will be populated from predictive models.</p>
      </app-section-card>

      <app-section-card title="Highest Risk Factors" description="Top contributors driving current risk.">
        <p>Risk factor decomposition will appear here.</p>
      </app-section-card>

      <app-section-card title="AI Recommendation" description="Recommended actions to reduce risk.">
        <p>Prioritized recommendations will be generated per device context.</p>
      </app-section-card>

      <app-section-card title="Trending Devices" description="Peer trend comparison across related devices.">
        <p>Trend analytics will be shown in this panel.</p>
      </app-section-card>

      <app-section-card title="Future Failure Prediction" description="Probability forecast for upcoming failure windows.">
        <p>Failure prediction timeline will be connected in a future release.</p>
      </app-section-card>
    </section>
  `,
  styles: `
    .widget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }

    p {
      margin: 0;
      color: var(--app-text-muted);
      line-height: 1.6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicePredictiveRiskTabComponent {}
