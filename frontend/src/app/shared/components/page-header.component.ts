import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
    </header>
  `,
  styles: `
    .page-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0 0 0.5rem;
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      color: var(--app-text);
    }

    p {
      margin: 0;
      color: var(--app-text-muted);
      max-width: 720px;
      line-height: 1.65;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
