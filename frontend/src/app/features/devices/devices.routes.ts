import { Routes } from '@angular/router';

export const DEVICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/devices-page.component').then((m) => m.DevicesPageComponent)
  },
  {
    path: ':deviceId',
    loadComponent: () => import('./pages/device-details-page.component').then((m) => m.DeviceDetailsPageComponent),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./tabs/device-overview-tab.component').then((m) => m.DeviceOverviewTabComponent)
      },
      {
        path: 'incidents',
        loadComponent: () => import('./tabs/device-incidents-tab.component').then((m) => m.DeviceIncidentsTabComponent)
      },
      {
        path: 'lifecycle',
        loadComponent: () => import('./tabs/device-lifecycle-tab.component').then((m) => m.DeviceLifecycleTabComponent)
      },
      {
        path: 'topology',
        loadComponent: () => import('./tabs/device-topology-tab.component').then((m) => m.DeviceTopologyTabComponent)
      },
      {
        path: 'compliance',
        loadComponent: () => import('./tabs/device-compliance-tab.component').then((m) => m.DeviceComplianceTabComponent)
      }
    ]
  }
];
