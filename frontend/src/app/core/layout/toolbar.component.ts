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
      <div class="toolbar__brand">
        <div class="toolbar__brand-icon">
          <mat-icon>hub</mat-icon>
        </div>
        <div>
          <div class="toolbar__title">Sentinel Compliance AI</div>
          <div class="toolbar__subtitle">PLATFORM · V2.0</div>
        </div>
      </div>

      <span class="toolbar__spacer"></span>

      <div class="toolbar__search">
        <mat-icon class="toolbar__search-icon">search</mat-icon>
        <input class="toolbar__search-input" placeholder="Search devices, incidents, controls…" />
        <span class="toolbar__search-kbd">⌘K</span>
      </div>

      <span class="toolbar__spacer"></span>

      <button mat-icon-button class="toolbar__icon-btn" aria-label="Notifications">
        <mat-icon>notifications_none</mat-icon>
      </button>

      <div class="toolbar__avatar" aria-label="User menu">
        <span class="toolbar__avatar-initials">NG</span>
        <div class="toolbar__avatar-info">
          <span class="toolbar__avatar-name">Admin</span>
          <span class="toolbar__avatar-role">Network Engineer</span>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: `
    .top-toolbar {
      height: 64px;
      padding: 0 1.5rem;
      background: var(--app-surface);
      color: var(--app-text);
      border-bottom: 1px solid var(--app-border);
      display: flex;
      align-items: center;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar__brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
      flex-shrink: 0;
    }

    .toolbar__brand-icon {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.6rem;
      display: grid;
      place-items: center;
      background: var(--app-primary-soft);
      border: 1px solid var(--app-border-accent);
      color: var(--app-primary);
    }

    .toolbar__title {
      font-size: 0.9rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: 0.01em;
      color: var(--app-text);
    }

    .toolbar__subtitle {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--app-primary);
      line-height: 1.2;
      letter-spacing: 0.08em;
    }

    .toolbar__spacer {
      flex: 1 1 auto;
    }

    .toolbar__search {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--app-surface-strong);
      border: 1px solid var(--app-border);
      border-radius: 0.6rem;
      padding: 0.45rem 0.8rem;
      width: 22rem;
      transition: border-color 0.15s;
    }

    .toolbar__search:focus-within {
      border-color: rgba(245, 158, 11, 0.4);
    }

    .toolbar__search-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      color: var(--app-text-muted);
      flex-shrink: 0;
    }

    .toolbar__search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--app-text);
      font-size: 0.85rem;
      font-family: inherit;
    }

    .toolbar__search-input::placeholder {
      color: var(--app-text-muted);
    }

    .toolbar__search-kbd {
      font-size: 0.7rem;
      color: var(--app-text-muted);
      background: var(--app-surface-mid);
      border: 1px solid var(--app-border);
      border-radius: 0.3rem;
      padding: 0.1rem 0.35rem;
      font-family: monospace;
      flex-shrink: 0;
    }

    .toolbar__icon-btn {
      color: var(--app-text-secondary);
      width: 2.25rem;
      height: 2.25rem;
      flex-shrink: 0;
    }

    .toolbar__icon-btn:hover {
      color: var(--app-text);
      background: var(--app-surface-strong);
    }

    .toolbar__avatar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.35rem 0.75rem 0.35rem 0.35rem;
      border-radius: 2rem;
      background: var(--app-surface-strong);
      border: 1px solid var(--app-border);
      cursor: pointer;
      transition: border-color 0.15s;
      flex-shrink: 0;
    }

    .toolbar__avatar:hover {
      border-color: rgba(245, 158, 11, 0.3);
    }

    .toolbar__avatar-initials {
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 50%;
      background: var(--app-primary);
      color: #080c14;
      font-size: 0.7rem;
      font-weight: 800;
      display: grid;
      place-items: center;
      letter-spacing: 0.02em;
      flex-shrink: 0;
    }

    .toolbar__avatar-info {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .toolbar__avatar-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--app-text);
      line-height: 1.2;
    }

    .toolbar__avatar-role {
      font-size: 0.68rem;
      color: var(--app-text-muted);
      line-height: 1.2;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {}
