import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ToolbarComponent } from './toolbar.component';
import { SideNavComponent } from './sidenav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, ToolbarComponent, SideNavComponent],
  template: `
    <div class="app-shell">
      <app-toolbar />

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav mode="side" [opened]="isExpanded()" class="app-sidenav">
          <app-sidenav />
        </mat-sidenav>

        <mat-sidenav-content>
          <main class="content-area">
            <div class="page-shell">
              <router-outlet />
            </div>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: `
    .app-shell {
      min-height: 100vh;
      background: var(--app-background);
    }

    .sidenav-container {
      min-height: calc(100vh - 64px);
      background: transparent;
    }

    .app-sidenav {
      width: 240px;
      border-right: 1px solid var(--app-border);
      background: var(--app-surface);
    }

    .content-area {
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background: var(--app-background);
    }

    .page-shell {
      max-width: 1440px;
      margin: 0 auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  readonly isExpanded = signal(true);
}
