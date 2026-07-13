import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
    </div>
  `,
  styles: `
    .empty-state {
      min-height: 220px;
      border: 1px dashed var(--app-border);
      border-radius: 1rem;
      display: grid;
      place-content: center;
      text-align: center;
      gap: 0.5rem;
      background: rgba(30, 41, 59, 0.35);
      color: var(--app-text-muted);
      padding: 1rem;
    }

    mat-icon {
      margin: 0 auto;
      color: var(--app-primary);
      width: 2rem;
      height: 2rem;
      font-size: 2rem;
    }

    h3 {
      margin: 0;
      color: var(--app-text);
      font-size: 1rem;
    }

    p {
      margin: 0;
      line-height: 1.55;
      font-size: 0.9rem;
      max-width: 460px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<string>('inbox');
}
