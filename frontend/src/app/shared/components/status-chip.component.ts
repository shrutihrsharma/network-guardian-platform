import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  template: `
    <span class="status-chip" [attr.data-tone]="tone()">
      {{ status() }}
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 0.35rem 0.7rem;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid var(--app-border);
      background: var(--app-primary-soft);
      color: var(--app-text);
    }

    .status-chip[data-tone='positive'] {
      background: rgba(34, 197, 94, 0.16);
      color: var(--app-success);
      border-color: rgba(34, 197, 94, 0.28);
    }

    .status-chip[data-tone='warning'] {
      background: rgba(245, 158, 11, 0.16);
      color: var(--app-warning);
      border-color: rgba(245, 158, 11, 0.28);
    }

    .status-chip[data-tone='critical'] {
      background: rgba(239, 68, 68, 0.16);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.28);
    }

    .status-chip[data-tone='neutral'] {
      background: rgba(148, 163, 184, 0.18);
      color: #cbd5e1;
      border-color: rgba(148, 163, 184, 0.28);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusChipComponent {
  readonly status = input.required<string>();

  protected readonly tone = computed(() => {
    const normalized = this.status().toLowerCase();

    if (['ready', 'healthy', 'active', 'compliant', 'low'].includes(normalized)) {
      return 'positive';
    }

    if (['coming soon', 'watch', 'review', 'maintenance', 'medium', 'warning', 'monitoring'].includes(normalized)) {
      return 'warning';
    }

    if (['critical', 'degraded', 'non-compliant', 'high'].includes(normalized)) {
      return 'critical';
    }

    return 'neutral';
  });
}
