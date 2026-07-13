import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionCardComponent } from '../../../shared/components/section-card.component';

@Component({
  selector: 'app-device-compliance-tab',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <section class="widget-grid">
      <app-section-card title="Patch Compliance" description="Patch posture by baseline and policy domain.">
        <p>Patch compliance metrics will be integrated in this card.</p>
      </app-section-card>

      <app-section-card title="Certificate Compliance" description="Certificate validity and trust-chain posture.">
        <p>Certificate compliance widgets will appear here.</p>
      </app-section-card>

      <app-section-card title="Configuration Drift" description="Detected configuration variance against templates.">
        <p>Configuration drift indicators will be populated in upcoming releases.</p>
      </app-section-card>

      <app-section-card title="Lifecycle Compliance" description="Lifecycle governance adherence status.">
        <p>Lifecycle compliance mappings will be surfaced in this view.</p>
      </app-section-card>

      <app-section-card title="KRIs" description="Key risk indicators for compliance operations.">
        <p>Compliance KRIs and thresholds will be configured here.</p>
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
export class DeviceComplianceTabComponent {}
