import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent)
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'devices',
    loadChildren: () => import('./features/devices/devices.routes').then((m) => m.DEVICES_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard-page.component').then((m) => m.DashboardPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'incidents',
    loadComponent: () =>
      import('./features/platform/pages/module-placeholder-page.component').then((m) => m.ModulePlaceholderPageComponent),
    canActivate: [authGuard],
    data: {
      title: 'Incidents',
      breadcrumb: 'Incidents',
      description: 'Incident operations across the enterprise device fleet, with AI-driven analysis and action pathways.',
      widgets: ['Open Incidents', 'Mean Time To Resolve', 'Escalation Queue', 'AI Triage Readiness'],
      actionLabel: 'Open Incident AI Workflow',
      actionRoute: '/incident'
    }
  },
  {
    path: 'lifecycle',
    loadComponent: () =>
      import('./features/lifecycle/pages/lifecycle-page.component').then((m) => m.LifecyclePageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'security',
    loadComponent: () =>
      import('./features/security/pages/security-page.component').then((m) => m.SecurityPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'compliance',
    loadChildren: () => import('./features/compliance/compliance.routes').then((m) => m.COMPLIANCE_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'decision-history',
    loadComponent: () => import('./features/history/pages/history-page.component').then((m) => m.HistoryPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/pages/settings-page.component').then((m) => m.SettingsPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'incident',
    loadComponent: () => import('./features/incident/pages/incident-page.component').then((m) => m.IncidentPageComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
