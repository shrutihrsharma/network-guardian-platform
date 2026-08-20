export interface SecurityFinding {
  id: string;
  deviceId: string;
  deviceName: string;
  vendor: string;
  region: string;
  businessService: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category:
    | 'FIREWALL'
    | 'ENCRYPTION'
    | 'CERTIFICATE'
    | 'AUTHENTICATION'
    | 'IDS'
    | 'CONFIGURATION'
    | 'NETWORK_ACCESS'
    | 'LOGGING'
    | 'VULNERABILITY';
  title: string;
  description: string;
  complianceImpact: 'PCI-DSS' | 'GDPR' | 'Internal Policy' | 'None';
  status: 'Open' | 'Mitigated' | 'Accepted';
  riskScore: number;
  affectedAssets: number;
  createdAt: string;
}

export interface RemediationPlanOwner {
  userId?: string;
  name?: string;
  team?: string;
  reason?: string;
  confidence?: number;
}

export interface RemediationPlan {
  findingId: string;
  title: string;
  summary: string;
  severity: string;
  businessImpact: string;
  rootCause: string;
  remediationSteps: string[];
  recommendedOwner: RemediationPlanOwner | null;
  ownerReason: string;
  estimatedEffort: string;
  riskIfNotResolved: string;
  confidence: number;
  generatedAt: string;
  provider?: string;
  model?: string;
}

export interface JiraTicketResponse {
  jiraKey: string;
  jiraUrl: string;
  status: 'CREATED' | 'ALREADY_EXISTS';
  assignee?: string;
  assigneeName?: string;
  createdAt: string;
}

export interface RemediationStatusResponse {
  findingId: string;
  remediationPlanId?: string;
  jiraKey: string;
  jiraUrl: string;
  jiraStatus: string;
  assignee?: string;
  lastUpdated?: string;
  remediationState: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'RESOLVED';
}

export interface RemediationVerificationResponse {
  findingId: string;
  jiraKey: string;
  result: 'VERIFIED' | 'NOT_VERIFIED';
  reason: string;
  evidence: string[];
  previousRiskScore?: number;
  currentRiskScore?: number;
  verifiedAt: string;
}

export interface SecurityFindingsFilters {
  vendor: string;
  region: string;
  category: string;
  severity: string;
  businessService: string;
  search: string;
}
