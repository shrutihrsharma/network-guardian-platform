export interface DecisionEvidenceItem {
  title: string;
  category: string;
  source: string;
  summary: string;
  referenceUrl?: string;
}

export interface DecisionResponse {
  decisionId: string;
  engine: string;
  decisionStatus: string;
  confidence: number;
  recommendation: string;
  reasoning: string;
  businessImpact: string;
  approvalRequired: boolean;
  evidence: DecisionEvidenceItem[];
  provider: string;
  model: string;
  executionTimeMs: number;
  promptVersion: string;
  // Lifecycle-specific (optional)
  risk?: string;
  summary?: string;
  recommendedVersion?: string;
  recommendedWindow?: string;
  complianceImpact?: string;
  rootCause?: string;
  automationAvailable?: string;
}
