import { Routes } from '@angular/router';

export const COMPLIANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/compliance-operations-page.component').then((m) => m.ComplianceOperationsPageComponent),
  },
  {
    path: 'kri-review',
    loadComponent: () =>
      import('./pages/compliance-kri-review-page.component').then((m) => m.ComplianceKriReviewPageComponent),
  },
];
