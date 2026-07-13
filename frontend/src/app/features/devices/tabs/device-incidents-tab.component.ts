import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { DeviceContextStore } from '../services/device-context.store';
import { SectionCardComponent } from '../../../shared/components/section-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-device-incidents-tab',
  standalone: true,
  imports: [SectionCardComponent, MatButtonModule, RouterLink, EmptyStateComponent],
  template: `
    @if (device(); as currentDevice) {
      <app-section-card
        title="Incident Operations"
        description="Device-scoped incident analysis will be integrated here."
      >
        <div class="entry-content">
          <p>
            The existing Incident AI workflow remains active and can be launched immediately while this device-centric
            workspace is expanded.
          </p>
          <p class="device-ref">Selected Device: {{ currentDevice.hostname }}</p>
          <a mat-flat-button routerLink="/incident">Open Existing Incident AI Workflow</a>
        </div>
      </app-section-card>
    } @else {
      <app-empty-state
        title="No device selected"
        description="Choose a device to open its incident workspace entry point."
        icon="warning"
      />
    }
  `,
  styles: `
    .entry-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.8rem;
    }

    p {
      margin: 0;
      line-height: 1.6;
      color: var(--app-text-muted);
    }

    .device-ref {
      color: var(--app-text);
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceIncidentsTabComponent {
  private readonly contextStore = inject(DeviceContextStore);

  protected readonly device = computed(() => this.contextStore.device());
}
