import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionCardComponent } from '../../../shared/components/section-card.component';

@Component({
  selector: 'app-device-ai-insights-tab',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <section class="widget-grid">
      <app-section-card title="Recent AI Decisions" description="Latest AI recommendations for this device.">
        <p>Recent decision artifacts will populate this panel.</p>
      </app-section-card>

      <app-section-card title="Recommended Actions" description="Action queue aligned to current device context.">
        <p>Recommended remediation and optimization actions will appear here.</p>
      </app-section-card>

      <app-section-card title="AI Confidence" description="Confidence profile for generated recommendations.">
        <p>Confidence breakdown by recommendation scope will be shown.</p>
      </app-section-card>

      <app-section-card title="Business Impact" description="Expected business outcome of suggested actions.">
        <p>Business impact projections will be rendered in this widget.</p>
      </app-section-card>

      <app-section-card title="Reasoning" description="Explainability details for AI output.">
        <p>Reasoning trace and evidence mapping will be displayed in this section.</p>
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
export class DeviceAiInsightsTabComponent {}
