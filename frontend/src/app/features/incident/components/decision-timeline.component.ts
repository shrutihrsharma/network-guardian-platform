import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface TimelineItem {
  title: string;
  icon: string;
}

@Component({
  selector: 'app-decision-timeline',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="timeline-card">
      <div class="timeline-card__header">
        <h3>Decision Timeline</h3>
        <p>Key milestones from incident intake to final decision storage.</p>
      </div>

      <div class="timeline-card__items">
        @for (item of items; track item.title) {
          <div class="timeline-item">
            <div class="timeline-item__icon">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="timeline-item__title">{{ item.title }}</div>
          </div>
        }
      </div>
    </mat-card>
  `,
  styles: `
    .timeline-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      box-shadow: none;
      padding: 1rem;
    }

    .timeline-card__header h3 {
      margin: 0 0 0.25rem;
      color: var(--app-text);
      font-size: 1.02rem;
      font-weight: 700;
    }

    .timeline-card__header p {
      margin: 0 0 1rem;
      color: var(--app-text-muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .timeline-card__items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .timeline-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0;
      border-bottom: 1px solid var(--app-border);
    }

    .timeline-item:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .timeline-item__icon {
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: var(--app-primary-soft);
      color: var(--app-primary);
      flex-shrink: 0;
    }

    .timeline-item__title {
      color: var(--app-text);
      font-weight: 600;
      font-size: 0.92rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecisionTimelineComponent {
  readonly items: TimelineItem[] = [
    { title: 'Incident Received', icon: 'notifications_active' },
    { title: 'Context Generated', icon: 'dynamic_feed' },
    { title: 'Prompt Generated', icon: 'edit_note' },
    { title: 'AI Response', icon: 'smart_toy' },
    { title: 'Decision Stored', icon: 'save' }
  ];
}
