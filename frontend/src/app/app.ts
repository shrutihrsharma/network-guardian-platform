import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  readonly authService = inject(AuthService);
}
