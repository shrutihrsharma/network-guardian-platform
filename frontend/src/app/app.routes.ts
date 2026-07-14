import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/devices', pathMatch: 'full' },
  {
    path: 'devices',
    loadChildren: () => import('./features/devices/devices.routes').then((m) => m.DEVICES_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard-page.component').then((m) => m.DashboardPageComponent)
  },
  {
    path: 'incidents',
    loadComponent: () =>
      import('./features/platform/pages/module-placeholder-page.component').then((m) => m.ModulePlaceholderPageComponent),
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
      import('./features/lifecycle/pages/lifecycle-page.component').then((m) => m.LifecyclePageComponent)
  },
  {
    path: 'compliance',
    loadComponent: () =>
      import('./features/platform/pages/module-placeholder-page.component').then((m) => m.ModulePlaceholderPageComponent),
    data: {
      title: 'Compliance',
      breadcrumb: 'Compliance',
      description: 'Compliance posture monitoring with auditable controls and enterprise governance visibility.',
      widgets: ['Patch Compliance', 'Certificate Posture', 'Configuration Drift', 'Compliance KRIs']
    }
  },
  {
    path: 'predictive-risk',
    loadComponent: () =>
      import('./features/platform/pages/module-placeholder-page.component').then((m) => m.ModulePlaceholderPageComponent),
    data: {
      title: 'Predictive Risk',
      breadcrumb: 'Predictive Risk',
      description: 'Predictive risk workspace for forecasting failure probability and operational impact.',
      widgets: ['Risk Score Distribution', 'Highest Risk Devices', 'Failure Forecast', 'Recommended Mitigations']
    }
  },
  {
    path: 'decision-history',
    loadComponent: () => import('./features/history/pages/history-page.component').then((m) => m.HistoryPageComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/pages/settings-page.component').then((m) => m.SettingsPageComponent)
  },
  {
    path: 'incident',
    loadComponent: () => import('./features/incident/pages/incident-page.component').then((m) => m.IncidentPageComponent)
  },
  { path: '**', redirectTo: '/devices' }
];
