import { DecisionResponse } from './decision-response.model';

export interface ComplianceSummaryCards {
  totalDevices: number;
  compliantDevices: number;
  atRiskDevices: number;
  criticalRiskDevices: number;
  averageCompliance: number;
  failedKriObservations: number;
}

export interface ComplianceBreakdownItem {
  name: string;
  deviceCount: number;
  highRiskDevices: number;
  averageCompliance: number;
}

export interface ComplianceKriFailureItem {
  kriId: string;
  kriName: string;
  severity: string;
  failedDevices: number;
}

export interface ComplianceHeatmapCell {
  region: string;
  riskLevel: string;
  deviceCount: number;
  averageCompliance: number;
}

export interface LifecycleCompliancePoint {
  lifecycleStage: string;
  deviceCount: number;
  averageCompliance: number;
}

export interface IncidentCompliancePoint {
  incidentBand: string;
  deviceCount: number;
  averageCompliance: number;
}

export interface ComplianceDashboardResponse {
  summaryCards: ComplianceSummaryCards;
  vendorCompliance: ComplianceBreakdownItem[];
  regionCompliance: ComplianceBreakdownItem[];
  deviceTypeCompliance: ComplianceBreakdownItem[];
  topFailedKRIs: ComplianceKriFailureItem[];
  complianceHeatmap: ComplianceHeatmapCell[];
  lifecycleVsCompliance: LifecycleCompliancePoint[];
  incidentVsCompliance: IncidentCompliancePoint[];
  generatedAt: string;
}

export interface ComplianceSummaryResponse {
  totalDevices: number;
  compliantDevices: number;
  mediumRiskDevices: number;
  highRiskDevices: number;
  criticalRiskDevices: number;
  averageCompliance: number;
  totalActiveKRIs: number;
  lastCalculated: string;
}

export interface DeviceComplianceResponse {
  deviceId: string;
  hostname: string;
  vendor: string;
  region: string;
  deviceType: string;
  lifecycleStage: string;
  incidentCount: number;
  overallCompliance: number;
  riskLevel: string;
  passedKRIs: string[];
  failedKRIs: string[];
  lastCalculated: string;
}

export interface ComplianceRecalculationResponse {
  devicesProcessed: number;
  averageCompliance: number;
  recalculatedAt: string;
}

export interface ComplianceKri {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  threshold: number;
  measurementFormula: string;
  enabled: boolean;
  approved: boolean;
  aiGenerated: boolean;
  createdDate: string;
}

export interface ComplianceDecisionRequest {
  deviceId?: string;
}

export interface ComplianceKriSuggestion {
  name: string;
  description: string;
  category: string;
  severity: string;
  threshold: number;
  measurementFormula: string;
}

export interface ComplianceKriGenerationResponse {
  decisionId: string;
  provider: string;
  model: string;
  executionTimeMs: number;
  suggestedKris: ComplianceKriSuggestion[];
}

export interface ApproveKriRequest {
  kriId: string;
  enabled: boolean;
}

export interface DecisionAuditRow {
  decisionId: string;
  timestamp: string;
  incidentId: string;
  module: string;
  engine: string;
  provider: string;
  model: string;
  decisionResponse: DecisionResponse;
}

export interface ComplianceKriTableRow {
  id: string;
  name: string;
  category: string;
  severity: string;
  threshold: number;
  currentValue: number;
  status: 'Passing' | 'Failing';
  aiGenerated: boolean;
  approved: boolean;
  enabled: boolean;
  description: string;
}

export interface ComplianceFilterState {
  search: string;
  vendor: string;
  region: string;
  deviceType: string;
  businessService: string;
  lifecycleStage: string;
  riskLevel: string;
}
