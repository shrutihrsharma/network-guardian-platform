import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DeviceInventoryItem } from '../../../core/models/device.model';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';

@Component({
  selector: 'app-device-header',
  standalone: true,
  imports: [StatusChipComponent],
  template: `
    <section class="device-header">
      <div class="device-header__title">
        <h1>{{ device().deviceName }}</h1>
        <p>{{ device().hostname }}</p>
      </div>

      <div class="device-header__grid">
        <div><span>Vendor</span><strong>{{ device().vendor }}</strong></div>
        <div><span>Model</span><strong>{{ device().model }}</strong></div>
        <div><span>Region</span><strong>{{ device().region }}</strong></div>
        <div><span>Criticality</span><strong>{{ device().criticality }}</strong></div>
        <div><span>Business Service</span><strong>{{ device().businessService }}</strong></div>
        <div>
          <span>Lifecycle Status</span>
          <app-status-chip [status]="device().lifecycleStatus" />
        </div>
        <div>
          <span>Current Health</span>
          <app-status-chip [status]="device().healthStatus" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .device-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      background: var(--app-surface);
      padding: 1.1rem;
    }

    .device-header__title h1 {
      margin: 0;
      font-size: clamp(1.3rem, 2.2vw, 1.7rem);
      color: var(--app-text);
    }

    .device-header__title p {
      margin: 0.3rem 0 0;
      color: var(--app-text-muted);
      font-size: 0.92rem;
    }

    .device-header__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.9rem;
    }

    .device-header__grid div {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .device-header__grid span {
      color: var(--app-text-muted);
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .device-header__grid strong {
      color: var(--app-text);
      font-size: 0.94rem;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceHeaderComponent {
  readonly device = input.required<DeviceInventoryItem>();
}
