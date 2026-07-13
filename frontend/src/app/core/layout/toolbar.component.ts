import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar class="top-toolbar">
      <button matIconButton class="toolbar__menu" aria-label="Toggle navigation">
        <mat-icon>hub</mat-icon>
      </button>

      <div class="toolbar__brand">
        <div class="toolbar__brand-icon">
          <mat-icon>hub</mat-icon>
        </div>
        <div>
          <div class="toolbar__title">Network Guardian AI Platform</div>
          <div class="toolbar__subtitle">Enterprise Network Operations Platform</div>
        </div>
      </div>

      <span class="toolbar__spacer"></span>

      <span class="status-chip">AI Enabled</span>
    </mat-toolbar>
  `,
  styles: `
    .top-toolbar {
      height: 64px;
      padding: 0 1.25rem;
      background: var(--app-surface);
      color: var(--app-text);
      border-bottom: 1px solid var(--app-border);
    }

    .toolbar__menu {
      color: var(--app-text);
      margin-right: 0.75rem;
    }

    .toolbar__brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
    }

    .toolbar__brand-icon {
      width: 2.4rem;
      height: 2.4rem;
      border-radius: 0.7rem;
      display: grid;
      place-items: center;
      background: var(--app-primary-soft);
      color: var(--app-primary);
    }

    .toolbar__title {
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .toolbar__subtitle {
      font-size: 0.78rem;
      color: var(--app-text-muted);
      line-height: 1.2;
      margin-top: 0.15rem;
    }

    .toolbar__spacer {
      flex: 1 1 auto;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--app-success);
      background: rgba(34, 197, 94, 0.16);
      border: 1px solid rgba(34, 197, 94, 0.28);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {}
