import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionCardComponent } from '../../../shared/components/section-card.component';

@Component({
  selector: 'app-device-lifecycle-tab',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <section class="tab-grid">
      <app-section-card title="Lifecycle Summary" description="Current lifecycle posture and support phase.">
        <p>Lifecycle status and ownership summary will be surfaced from lifecycle systems.</p>
      </app-section-card>

      <app-section-card title="Timeline Placeholder" description="Roadmap timeline container for upcoming lifecycle events.">
        <div class="timeline-placeholder">Lifecycle timeline visualization will render here.</div>
      </app-section-card>

      <app-section-card title="Upcoming Milestones" description="Upcoming lifecycle milestones for this device.">
        <p>Milestone forecasting and maintenance windows will appear in this panel.</p>
      </app-section-card>

      <app-section-card title="Vendor Support Status" description="Vendor EOS and support commitments.">
        <p>Support contracts and EOS checkpoints will be connected in a future release.</p>
      </app-section-card>
    </section>
  `,
  styles: `
    .tab-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    p {
      margin: 0;
      color: var(--app-text-muted);
      line-height: 1.6;
    }

    .timeline-placeholder {
      min-height: 160px;
      border: 1px dashed var(--app-border);
      border-radius: 0.9rem;
      display: grid;
      place-items: center;
      color: var(--app-text-muted);
      background: rgba(30, 41, 59, 0.35);
      text-align: center;
      padding: 0.9rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceLifecycleTabComponent {}
