import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <mat-toolbar class="top-toolbar">
      <a
        class="toolbar__brand toolbar__brand-link"
        [href]="landingPageUrl"
        aria-label="Go to Sentinel AI landing page"
      >
        <div class="toolbar__brand-icon">
          <img class="toolbar__brand-logo" src="assets/logo.svg" alt="Sentinel AI logo" />
        </div>
        <div>
          <div class="toolbar__title">Sentinel AI</div>
          <div class="toolbar__subtitle">PLATFORM · V2.0</div>
        </div>
      </a>

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

      <div class="toolbar__avatar" [matMenuTriggerFor]="userMenu" aria-label="User menu">
        @if (userPicture()) {
          <img
            class="toolbar__avatar-img"
            [src]="userPicture()"
            [alt]="userName()"
            referrerpolicy="no-referrer"
          />
        } @else {
          <span class="toolbar__avatar-initials">{{ userInitials() }}</span>
        }
        <div class="toolbar__avatar-info">
          <span class="toolbar__avatar-name">{{ userName() }}</span>
          <span class="toolbar__avatar-role">{{ userEmail() }}</span>
        </div>
        <mat-icon class="toolbar__avatar-chevron">expand_more</mat-icon>
      </div>

      <mat-menu #userMenu="matMenu" class="user-menu">
        <div class="user-menu__header" mat-menu-item disabled>
          <div class="user-menu__profile">
            @if (userPicture()) {
              <img class="user-menu__pic" [src]="userPicture()" [alt]="userName()" referrerpolicy="no-referrer" />
            } @else {
              <span class="user-menu__initials">{{ userInitials() }}</span>
            }
            <div>
              <div class="user-menu__name">{{ userName() }}</div>
              <div class="user-menu__email">{{ userEmail() }}</div>
            </div>
          </div>
        </div>
        <button mat-menu-item (click)="onSignOut()">
          <mat-icon>logout</mat-icon>
          <span>Sign out</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: `
    .top-toolbar {
      min-height: 132px;
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
      gap: 0.4rem;
      min-width: 0;
      flex-shrink: 0;
    }

    .toolbar__brand-link {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .toolbar__brand-link:hover {
      opacity: 0.92;
    }

    .toolbar__brand-icon {
      width: 6.75rem;
      height: 6.75rem;
      border-radius: 0.6rem;
      display: grid;
      place-items: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .toolbar__brand-logo {
      width: 135%;
      height: 135%;
      object-fit: cover;
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
      padding: 0.35rem 0.6rem 0.35rem 0.35rem;
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

    .toolbar__avatar-img {
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
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
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .toolbar__avatar-chevron {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      color: var(--app-text-muted);
      transition: transform 0.2s;
    }

    // ── User Menu ──

    .user-menu__header {
      pointer-events: none;
    }

    .user-menu__profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.25rem 0;
    }

    .user-menu__pic {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-menu__initials {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background: var(--app-primary);
      color: #080c14;
      font-size: 0.75rem;
      font-weight: 800;
      display: grid;
      place-items: center;
    }

    .user-menu__name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--app-text);
      line-height: 1.3;
    }

    .user-menu__email {
      font-size: 0.72rem;
      color: var(--app-text-muted);
      line-height: 1.3;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {
  private readonly authService = inject(AuthService);
  readonly landingPageUrl = environment.frontendReactLandingUrl;

  readonly userName = computed(() => this.authService.user()?.name ?? 'User');
  readonly userEmail = computed(() => this.authService.user()?.email ?? '');
  readonly userPicture = computed(() => this.authService.user()?.picture ?? '');
  readonly userInitials = computed(() => {
    const name = this.userName();
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  onSignOut(): void {
    this.authService.logout();
  }
}
