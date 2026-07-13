import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { SectionCardComponent } from '../../../shared/components/section-card.component';

interface ModulePageData {
  title: string;
  description: string;
  breadcrumb: string;
  widgets: string[];
  actionLabel?: string;
  actionRoute?: string;
}

@Component({
  selector: 'app-module-placeholder-page',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, SectionCardComponent],
  template: `
    <section class="module-page">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a routerLink="/devices">Devices</a>
        <span>/</span>
        <span>{{ data.breadcrumb }}</span>
      </nav>

      <app-page-header [title]="data.title" [description]="data.description" />

      @if (data.actionLabel && data.actionRoute) {
        <div class="module-action">
          <a [routerLink]="data.actionRoute">{{ data.actionLabel }}</a>
        </div>
      }

      <section class="widget-grid">
        @for (widget of data.widgets; track widget) {
          <app-section-card [title]="widget" description="Enterprise dashboard widget placeholder.">
            <p>Module telemetry, AI recommendations, and operational actions will be added in this panel.</p>
          </app-section-card>
        }
      </section>
    </section>
  `,
  styles: `
    .module-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--app-text-muted);
      font-size: 0.84rem;
    }

    .breadcrumb a {
      color: var(--app-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .widget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }

    .module-action {
      display: flex;
      justify-content: flex-end;
    }

    .module-action a {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      color: var(--app-text);
      background: var(--app-primary-soft);
      border: 1px solid var(--app-border);
      border-radius: 999px;
      padding: 0.45rem 0.8rem;
      font-size: 0.84rem;
      font-weight: 700;
    }

    p {
      margin: 0;
      color: var(--app-text-muted);
      line-height: 1.6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModulePlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly data = this.route.snapshot.data as ModulePageData;
}
