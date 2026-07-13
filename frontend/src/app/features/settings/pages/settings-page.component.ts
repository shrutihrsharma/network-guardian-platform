import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <section class="page-card">
      <app-page-header title="Settings" description="Platform and engine configuration settings will be added here." />
      <div class="placeholder"><p>Coming Soon</p></div>
    </section>
  `,
  styles: `
    .page-card { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
    .placeholder { min-height: 280px; width: min(100%, 640px); border: 1px dashed var(--app-border); border-radius: 1.25rem; display: grid; place-items: center; color: var(--app-text-muted); background: rgba(30, 41, 59, 0.5); }
    .placeholder p { font-size: 1.2rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {}
