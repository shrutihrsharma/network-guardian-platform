import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DeviceContextStore } from '../services/device-context.store';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { SectionCardComponent } from '../../../shared/components/section-card.component';

@Component({
  selector: 'app-device-overview-tab',
  standalone: true,
  imports: [SectionCardComponent, EmptyStateComponent],
  template: `
    @if (device(); as currentDevice) {
      <section class="overview-grid">
        <app-section-card title="General Information" description="Identity and platform metadata.">
          <dl>
            <div><dt>Device ID</dt><dd>{{ currentDevice.id }}</dd></div>
            <div><dt>Hostname</dt><dd>{{ currentDevice.hostname }}</dd></div>
            <div><dt>Vendor</dt><dd>{{ currentDevice.vendor }}</dd></div>
            <div><dt>Model</dt><dd>{{ currentDevice.model }}</dd></div>
            <div><dt>Device Type</dt><dd>{{ currentDevice.deviceType }}</dd></div>
            <div><dt>OS Version</dt><dd>{{ currentDevice.osVersion }}</dd></div>
          </dl>
        </app-section-card>

        <app-section-card title="Lifecycle Summary" description="Current lifecycle and support posture.">
          <dl>
            <div><dt>Lifecycle Status</dt><dd>{{ currentDevice.lifecycleStatus }}</dd></div>
            <div><dt>Compliance</dt><dd>{{ currentDevice.complianceStatus }}</dd></div>
            <div><dt>Predictive Risk</dt><dd>{{ currentDevice.predictiveRisk }}</dd></div>
            <div><dt>Criticality</dt><dd>{{ currentDevice.criticality }}</dd></div>
          </dl>
        </app-section-card>

        <app-section-card title="Current Health" description="Operational signal across monitoring domains.">
          <dl>
            <div><dt>Health Status</dt><dd>{{ currentDevice.healthStatus }}</dd></div>
            <div><dt>Region</dt><dd>{{ currentDevice.region }}</dd></div>
            <div><dt>Business Service</dt><dd>{{ currentDevice.businessService }}</dd></div>
          </dl>
        </app-section-card>

        <app-section-card title="Recent Alerts" description="Alert stream integration point for NOC events.">
          <p class="placeholder-text">Device alert feed will be connected in the upcoming release.</p>
        </app-section-card>

        <app-section-card title="AI Status" description="AI enablement and decision readiness for this device.">
          <dl>
            <div><dt>Decision Context</dt><dd>Available</dd></div>
            <div><dt>Recommendation Mode</dt><dd>Advisory</dd></div>
            <div><dt>Audit Trail</dt><dd>Enabled</dd></div>
          </dl>
        </app-section-card>
      </section>
    } @else {
      <app-empty-state
        title="Device context is unavailable"
        description="Select a device from inventory to load overview details."
        icon="dns"
      />
    }
  `,
  styles: `
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }

    dl {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    dl div {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      padding-bottom: 0.45rem;
    }

    dt {
      color: var(--app-text-muted);
      font-size: 0.84rem;
    }

    dd {
      margin: 0;
      color: var(--app-text);
      font-size: 0.9rem;
      font-weight: 600;
      text-align: right;
    }

    .placeholder-text {
      margin: 0;
      color: var(--app-text-muted);
      line-height: 1.55;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceOverviewTabComponent {
  private readonly contextStore = inject(DeviceContextStore);

  protected readonly device = computed(() => this.contextStore.device());
}
