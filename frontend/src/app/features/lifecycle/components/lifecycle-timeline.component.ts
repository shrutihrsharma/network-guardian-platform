import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  DeviceLifecycleSummary,
  LIFECYCLE_STAGES,
  STAGE_CONFIG,
  LifecycleStage,
} from '../../../core/models/lifecycle.model';

@Component({
  selector: 'app-lifecycle-timeline',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="timeline-wrap">
      <!-- Stage track -->
      <div class="stage-track">
        @for (stage of stages; track stage; let i = $index) {
          <div class="stage-node" [class.past]="isPast(stage)" [class.current]="isCurrent(stage)" [class.future]="isFuture(stage)">
            <div class="stage-icon" [style.background]="stageConf(stage).bg" [style.border-color]="stageConf(stage).color" [style.color]="stageConf(stage).color">
              <mat-icon>{{ stageConf(stage).icon }}</mat-icon>
            </div>
            <div class="stage-label">{{ stage }}</div>
            <div class="stage-date">{{ stageDate(stage) }}</div>
          </div>
          @if (i < stages.length - 1) {
            <div class="stage-connector" [class.active]="isConnectorActive(stage)"></div>
          }
        }
      </div>

      <!-- Today marker -->
      <div class="today-row">
        <span class="today-chip">
          <mat-icon>today</mat-icon>
          Today — {{ currentStage() }}
          @if (summary(); as s) {
            &nbsp;·&nbsp;{{ daysLabel(s.daysUntilUnsupported) }}
          }
        </span>
      </div>
    </div>
  `,
  styles: `
    .timeline-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .stage-track {
      display: flex;
      align-items: flex-start;
      gap: 0;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .stage-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      min-width: 7rem;
      flex-shrink: 0;
    }

    .stage-icon {
      width: 2.6rem;
      height: 2.6rem;
      border-radius: 50%;
      border: 2px solid;
      display: grid;
      place-items: center;
      transition: transform 0.15s;
    }

    .stage-icon mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .stage-node.past .stage-icon {
      opacity: 0.45;
    }

    .stage-node.current .stage-icon {
      transform: scale(1.18);
      box-shadow: 0 0 0 4px rgba(255,255,255,0.08);
    }

    .stage-node.future .stage-icon {
      opacity: 0.25;
    }

    .stage-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-align: center;
      color: var(--app-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.2;
    }

    .stage-node.current .stage-label {
      color: var(--app-text);
    }

    .stage-date {
      font-size: 0.68rem;
      color: var(--app-text-muted);
      text-align: center;
      line-height: 1.2;
    }

    .stage-connector {
      flex: 1;
      height: 2px;
      background: var(--app-border);
      margin-top: 1.25rem;
      min-width: 1rem;
    }

    .stage-connector.active {
      background: var(--app-primary);
      opacity: 0.6;
    }

    .today-row {
      display: flex;
      justify-content: center;
    }

    .today-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      background: var(--app-primary-soft);
      border: 1px solid var(--app-border-accent);
      color: var(--app-primary);
      font-size: 0.78rem;
      font-weight: 600;
    }

    .today-chip mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecycleTimelineComponent {
  readonly summary = input<DeviceLifecycleSummary | null>(null);

  readonly stages = [...LIFECYCLE_STAGES];

  readonly currentStage = computed(() => this.summary()?.lifecycleStage ?? '');

  stageConf(stage: LifecycleStage) {
    return STAGE_CONFIG[stage];
  }

  isPast(stage: LifecycleStage) {
    const cur = this.currentStage();
    if (!cur) return false;
    return STAGE_CONFIG[stage as LifecycleStage].order < STAGE_CONFIG[cur as LifecycleStage]?.order;
  }

  isCurrent(stage: LifecycleStage) {
    return stage === this.currentStage();
  }

  isFuture(stage: LifecycleStage) {
    const cur = this.currentStage();
    if (!cur) return true;
    return STAGE_CONFIG[stage as LifecycleStage].order > STAGE_CONFIG[cur as LifecycleStage]?.order;
  }

  isConnectorActive(stage: LifecycleStage) {
    return this.isPast(stage) || this.isCurrent(stage);
  }

  stageDate(stage: LifecycleStage): string {
    const s = this.summary();
    if (!s) return '';
    const map: Record<LifecycleStage, string> = {
      'Engineering Testing': s.engineeringTestingDate,
      'Invest': s.investDate,
      'Maintain': s.maintainDate,
      'Disinvest': s.disinvestDate,
      'Unsupported': s.unsupportedDate,
    };
    return map[stage] ?? '';
  }

  daysLabel(days: number): string {
    if (days < 0) return `${Math.abs(days)}d unsupported`;
    if (days === 0) return 'Unsupported today';
    if (days <= 90) return `${days}d to EOL`;
    return `${Math.ceil(days / 30)}mo to EOL`;
  }
}
