export interface DecisionResponse {
  decisionId: string;
  engine: string;
  decisionStatus: string;
  confidence: number;
  recommendation: string;
  reasoning: string;
  businessImpact: string;
  approvalRequired: boolean;
  evidence: string[];
  provider: string;
  model: string;
  executionTimeMs: number;
  promptVersion: string;
  // Lifecycle-specific (optional)
  risk?: string;
  summary?: string;
  recommendedVersion?: string;
  recommendedWindow?: string;
}
