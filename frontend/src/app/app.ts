import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MainLayoutComponent } from './core/layout/main-layout.component';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
