import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionCardComponent } from '../../../shared/components/section-card.component';

@Component({
  selector: 'app-device-topology-tab',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card title="Topology Workspace" description="Reserved area for graph-based network topology operations.">
      <div class="topology-placeholder">Interactive Network Topology</div>
    </app-section-card>
  `,
  styles: `
    .topology-placeholder {
      min-height: 360px;
      border: 1px dashed var(--app-border);
      border-radius: 1rem;
      display: grid;
      place-items: center;
      text-align: center;
      background: rgba(30, 41, 59, 0.3);
      color: var(--app-text-muted);
      font-size: 1.02rem;
      font-weight: 600;
      letter-spacing: 0.03em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceTopologyTabComponent {}
