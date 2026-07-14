export interface SoftwareLifecycle {
  id: string;
  vendor: string;
  deviceFamily: string;
  osVersion: string;
  engineeringTestingDate: string;
  investDate: string;
  maintainDate: string;
  disinvestDate: string;
  unsupportedDate: string;
  recommendedVersion: string;
  notes: string;
}

export interface DeviceLifecycleSummary {
  deviceId: string;
  hostname: string;
  vendor: string;
  family: string;
  model: string;
  region: string;
  businessService: string;
  criticality: string;
  osVersion: string;
  recommendedVersion: string;
  lifecycleStage: 'Engineering Testing' | 'Invest' | 'Maintain' | 'Disinvest' | 'Unsupported';
  daysUntilUnsupported: number;
  engineeringTestingDate: string;
  investDate: string;
  maintainDate: string;
  disinvestDate: string;
  unsupportedDate: string;
  notes: string;
}

export interface VendorSummary {
  vendor: string;
  unsupported: number;
  disinvest: number;
  maintain: number;
  invest: number;
  engineeringTesting: number;
}

export interface LifecycleDashboardStats {
  totalDevices: number;
  unsupportedDevices: number;
  disinvestDevices: number;
  maintainDevices: number;
  investDevices: number;
  engineeringTestingDevices: number;
  upcomingEol90Days: number;
  averageUpgradeRisk: number;
  vendorSummary: VendorSummary[];
  criticalDevices: DeviceLifecycleSummary[];
}

export interface LifecycleDecisionRequest {
  deviceId: string;
}

export interface LifecycleFilters {
  vendor: string;
  region: string;
  family: string;
  lifecycleStage: string;
  criticality: string;
  businessService: string;
  search: string;
}

export const LIFECYCLE_STAGES = [
  'Engineering Testing',
  'Invest',
  'Maintain',
  'Disinvest',
  'Unsupported'
] as const;

export type LifecycleStage = typeof LIFECYCLE_STAGES[number];

export const STAGE_CONFIG: Record<LifecycleStage, { color: string; bg: string; icon: string; order: number }> = {
  'Engineering Testing': { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: 'science',       order: 0 },
  'Invest':              { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   icon: 'trending_up',  order: 1 },
  'Maintain':            { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: 'check_circle', order: 2 },
  'Disinvest':           { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  icon: 'trending_down',order: 3 },
  'Unsupported':         { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: 'block',        order: 4 },
};
