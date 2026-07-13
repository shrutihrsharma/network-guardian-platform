import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MetricCardComponent } from './metric-card.component';

export interface SummaryMetric {
  title: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [MetricCardComponent],
  template: `
    <section class="summary-grid" aria-label="Summary metrics">
      @for (metric of metrics(); track metric.title) {
        <app-metric-card [title]="metric.title" [value]="metric.value" [icon]="metric.icon" />
      }
    </section>
  `,
  styles: `
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryCardsComponent {
  readonly metrics = input.required<SummaryMetric[]>();
}
