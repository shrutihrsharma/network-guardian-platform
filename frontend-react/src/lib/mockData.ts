export type Severity = "Critical" | "High" | "Medium" | "Low";
export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export interface Application {
  id: string;
  name: string;
  businessUnit: string;
  businessDomain: string;
  criticality: "Tier 1" | "Tier 2" | "Tier 3";
  owner: string;
  businessOwner: string;
  currentCompliance: number;
  predictedCompliance: number;
  complianceStatus: "Compliant" | "At Risk" | "Critical";
  aiConfidence: number;
  riskScore: number;
  currentRisk: RiskLevel;
  predictedRisk: RiskLevel;
  probability: number;
  lastScan: string;
  certificateExpiryDays: number;
  certificateStatus: string;
  openVulnerabilities: number;
  openIncidents: number;
  businessImpact: "Low" | "Medium" | "High";
  technologyStack: string;
  hostingEnvironment: string;
  operationalDashboard: string;
  persona: string;
  recommendedAction: string;
  executiveSummary: string;
  aiRecommendation: string;
  reasons: string[];
  actions: { label: string; impact: number }[];
  estimatedReduction: number;
}

export const businessUnits = [
  "Corporate Banking",
  "Investment Banking",
  "Retail Banking",
  "Treasury",
  "Technology",
  "Security",
  "Network Infrastructure",
];

const appSeeds = [
  { name: "Payments API", bu: "Retail Banking", crit: "Tier 1", owner: "L. Bergmann" },
  { name: "Retail Banking Portal", bu: "Retail Banking", crit: "Tier 1", owner: "M. Chen" },
  { name: "Customer Onboarding", bu: "Retail Banking", crit: "Tier 2", owner: "A. Patel" },
  { name: "Trade Engine", bu: "Investment Banking", crit: "Tier 1", owner: "R. Kowalski" },
  { name: "KYC Service", bu: "Security", crit: "Tier 1", owner: "S. Okafor" },
  { name: "Treasury Platform", bu: "Treasury", crit: "Tier 1", owner: "J. Moreau" },
  { name: "Fraud Detection", bu: "Security", crit: "Tier 1", owner: "P. Nakamura" },
  { name: "Mobile Banking", bu: "Retail Banking", crit: "Tier 1", owner: "E. Rossi" },
  { name: "Corporate Lending", bu: "Corporate Banking", crit: "Tier 2", owner: "H. Andersen" },
  { name: "Risk Analytics", bu: "Technology", crit: "Tier 2", owner: "D. Fischer" },
  { name: "Settlement Engine", bu: "Investment Banking", crit: "Tier 1", owner: "T. Vasquez" },
  { name: "AML Screening", bu: "Security", crit: "Tier 1", owner: "N. Al-Sayed" },
  { name: "Wealth Portal", bu: "Corporate Banking", crit: "Tier 2", owner: "C. Dubois" },
  { name: "FX Trading", bu: "Treasury", crit: "Tier 1", owner: "V. Ivanov" },
  { name: "Ledger Core", bu: "Technology", crit: "Tier 1", owner: "K. Yamamoto" },
];

const reasonPool = [
  "Critical Veracode findings unresolved",
  "TLS Certificate expires in 12 days",
  "DR test overdue by 47 days",
  "Repeated failed deployments (7 last 30d)",
  "High ACM policy violations",
  "End-of-life dependency detected",
  "High business criticality",
  "Elevated secrets scanning alerts",
  "Cloud misconfiguration drift",
  "Audit finding open > SLA",
];

const actionPool = [
  { label: "Fix top 5 Veracode findings", impact: 22 },
  { label: "Complete DR validation", impact: 15 },
  { label: "Renew expiring certificates", impact: 12 },
  { label: "Upgrade EOL dependency", impact: 10 },
  { label: "Close open ACM violations", impact: 9 },
  { label: "Rotate exposed secrets", impact: 7 },
];

function riskFromScore(s: number): RiskLevel {
  if (s >= 80) return "Critical";
  if (s >= 60) return "High";
  if (s >= 35) return "Medium";
  return "Low";
}

const seededApplications: Application[] = appSeeds.map((s, i) => {
  const riskScore = [92, 74, 58, 88, 41, 66, 81, 55, 47, 62, 79, 84, 38, 71, 52][i];
  const currentCompliance = 100 - Math.round(riskScore * 0.35) - (i % 4);
  const predictedCompliance = Math.max(40, currentCompliance - Math.round(riskScore * 0.25));
  const currentRiskScore = Math.max(15, riskScore - 40);
  return {
    id: `app-${i + 1}`,
    name: s.name,
    businessUnit: s.bu,
    businessDomain: s.bu,
    criticality: s.crit as Application["criticality"],
    owner: s.owner,
    businessOwner: s.owner,
    currentCompliance,
    predictedCompliance,
    complianceStatus: predictedCompliance < 70 ? "At Risk" : "Compliant",
    aiConfidence: 88 + ((i * 7) % 11),
    riskScore,
    currentRisk: riskFromScore(currentRiskScore),
    predictedRisk: riskFromScore(riskScore),
    probability: 55 + ((i * 13) % 40),
    lastScan: `${1 + (i % 9)}h ago`,
    certificateExpiryDays: 12 + (i % 45),
    certificateStatus: i % 3 === 0 ? `Expiring in ${12 + (i % 45)} days` : "Healthy",
    openVulnerabilities: 2 + (i % 9),
    openIncidents: 1 + (i % 4),
    businessImpact: s.crit === "Tier 1" ? "High" : "Medium",
    technologyStack: "Java, Spring Boot, APIs",
    hostingEnvironment: i % 2 === 0 ? "Hybrid Cloud" : "Public Cloud",
    operationalDashboard: "Network Guardian",
    persona: "ITO",
    recommendedAction: "Prioritize control remediation and validate compliance evidence.",
    executiveSummary: `${s.name} remains within acceptable thresholds but requires active monitoring due to predicted control drift.`,
    aiRecommendation: "AI recommends prioritizing the highest-impact remediation items to reduce near-term audit exposure.",
    reasons: reasonPool.slice(0, 4 + (i % 4)),
    actions: actionPool.slice(0, 3 + (i % 3)),
    estimatedReduction: 40 + ((i * 9) % 45),
  };
});

const gnsNetworker: Application = {
  id: `app-${appSeeds.length + 1}`,
  name: "GNS Networker",
  businessUnit: "Network Infrastructure",
  businessDomain: "Network Infrastructure",
  criticality: "Tier 1",
  owner: "Network Engineering",
  businessOwner: "Network Engineering",
  currentCompliance: 68,
  predictedCompliance: 52,
  complianceStatus: "At Risk",
  aiConfidence: 96,
  riskScore: 92,
  currentRisk: "High",
  predictedRisk: "Critical",
  probability: 92,
  lastScan: "45m ago",
  certificateExpiryDays: 18,
  certificateStatus: "Expiring in 18 days",
  openVulnerabilities: 7,
  openIncidents: 3,
  businessImpact: "High",
  technologyStack: "Java, Spring Boot, Network Automation",
  hostingEnvironment: "Private Cloud",
  operationalDashboard: "Network Guardian",
  persona: "ITO",
  recommendedAction: "Renew certificates, validate configuration compliance, and review incident trends.",
  executiveSummary:
    "This application is forecasted to become non-compliant within 30 days if remediation is not completed.",
  aiRecommendation:
    "AI predicts elevated operational risk due to expiring certificates and recent incident trends. Immediate certificate renewal and compliance validation are recommended.",
  reasons: [
    "TLS certificate expires in 18 days",
    "Three open incidents indicate elevated operational instability",
    "Seven unresolved vulnerabilities remain above SLA",
    "Tier-1 service with high business impact in network infrastructure",
  ],
  actions: [
    { label: "Renew expiring production certificates", impact: 18 },
    { label: "Validate configuration compliance across network automation pipelines", impact: 12 },
    { label: "Review active incident trends and implement remediation", impact: 11 },
  ],
  estimatedReduction: 41,
};

export const applications: Application[] = [...seededApplications, gnsNetworker];

export const kpis = {
  complianceScore: 96,
  applicationsMonitored: 1285,
  applicationsAtRisk: 68,
  criticalRisks: 13,
  predictedAuditFailures: 10,
  avgAiConfidence: 97,
};

export const complianceTrend = [
  { month: "Jan", score: 91, risk: 42 },
  { month: "Feb", score: 92, risk: 39 },
  { month: "Mar", score: 90, risk: 45 },
  { month: "Apr", score: 93, risk: 36 },
  { month: "May", score: 94, risk: 32 },
  { month: "Jun", score: 93, risk: 34 },
  { month: "Jul", score: 95, risk: 28 },
  { month: "Aug", score: 94, risk: 30 },
  { month: "Sep", score: 96, risk: 24 },
  { month: "Oct", score: 96, risk: 22 },
  { month: "Nov", score: 97, risk: 19 },
  { month: "Dec", score: 96, risk: 21 },
];

export const complianceDistribution = [
  { name: "Compliant", value: 1042, color: "var(--success)" },
  { name: "At Risk", value: 176, color: "var(--warning)" },
  { name: "Critical", value: 67, color: "var(--danger)" },
];

export const upcomingAudits = [
  { name: "SOX Q4 Audit", date: "Dec 15", days: 12, severity: "High" },
  { name: "GDPR Assessment", date: "Jan 08", days: 36, severity: "Medium" },
  { name: "PCI-DSS Review", date: "Jan 22", days: 50, severity: "Critical" },
  { name: "MAS Cyber Hygiene", date: "Feb 03", days: 62, severity: "High" },
  { name: "Internal Cloud Audit", date: "Feb 19", days: 78, severity: "Medium" },
];

const heatSeed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 20 + (Math.abs(h) % 80);
};
export const heatmap = businessUnits.map((bu) => ({
  bu,
  values: ["Veracode", "ACM", "DR", "Certs", "Secrets", "Cloud"].map((cat) => ({
    cat,
    value: heatSeed(bu + cat),
  })),
}));

export const recentDecisions = [
  { id: 1, title: "Auto-approve certificate renewal — Payments API", confidence: 98, status: "Approved" },
  { id: 2, title: "Escalate Veracode critical — Trade Engine", confidence: 94, status: "Escalated" },
  { id: 3, title: "Defer non-critical patch — Wealth Portal", confidence: 89, status: "Deferred" },
  { id: 4, title: "Open Jira: DR test — Treasury Platform", confidence: 96, status: "Actioned" },
];

export const recommendations = [
  { id: 1, title: "Prioritize Payments API remediation", impact: "Prevents predicted audit failure", risk: 68 },
  { id: 2, title: "Renew 8 expiring certificates this week", impact: "Blocks 3 outages", risk: 42 },
  { id: 3, title: "Sunset EOL library across 14 apps", impact: "Removes recurring finding", risk: 55 },
  {
    id: 4,
    title:
      "AI predicts elevated operational risk due to expiring certificates and recent incident trends. Immediate certificate renewal and compliance validation are recommended.",
    impact: "Protects GNS Networker from near-term non-compliance and operational disruption",
    risk: 92,
  },
];

export const pendingApprovals = [
  { id: 1, title: "Grant exception — KYC Service dependency", requester: "S. Okafor", confidence: 92, effort: "Low" },
  { id: 2, title: "Emergency change — Fraud Detection cert", requester: "P. Nakamura", confidence: 97, effort: "Medium" },
  { id: 3, title: "Waive control — Corporate Lending", requester: "H. Andersen", confidence: 74, effort: "High" },
];

export type Finding = {
  id: string;
  app: string;
  bu: string;
  type: string;
  severity: Severity;
  title: string;
  age: number;
  riskScore: number;
};

const findingTitles: Record<string, string[]> = {
  Veracode: ["SQL Injection in checkout handler", "XSS in profile page", "Insecure deserialization", "Hardcoded credential"],
  ACM: ["Policy drift on IAM role", "Untagged production asset", "Public S3 bucket detected"],
  DR: ["DR test overdue", "Failover RTO exceeded", "Backup verification missed"],
  Certificates: ["TLS cert expires in 12 days", "Self-signed cert in production", "Weak cipher suite"],
  Secrets: ["Exposed API key in repo", "Rotated key not deployed"],
  Cloud: ["Public network exposure", "Unencrypted volume", "Missing MFA on root"],
  Infrastructure: ["Kernel patch missing", "Unsupported OS version"],
  Dependencies: ["log4j 2.14 detected", "openssl 1.0.2 EOL"],
  "Open Audit Findings": ["SOX control gap", "PCI segment breach"],
};

const severities: Severity[] = ["Critical", "High", "Medium", "Low"];

export const findings: Finding[] = [];
let fid = 1;
for (const app of applications) {
  const count = 4 + (fid % 4);
  for (let i = 0; i < count; i++) {
    const types = Object.keys(findingTitles);
    const type = types[(fid + i) % types.length];
    const titles = findingTitles[type];
    const sev = severities[(fid + i) % severities.length];
    findings.push({
      id: `F-${fid}`,
      app: app.name,
      bu: app.businessUnit,
      type,
      severity: sev,
      title: titles[(fid + i) % titles.length],
      age: 1 + ((fid * 3) % 90),
      riskScore: 20 + ((fid * 7) % 80),
    });
    fid++;
  }
}

findings.push(
  {
    id: `F-${fid++}`,
    app: gnsNetworker.name,
    bu: gnsNetworker.businessUnit,
    type: "Certificates",
    severity: "High",
    title: "Production TLS certificate expires in 18 days",
    age: 12,
    riskScore: 91,
  },
  {
    id: `F-${fid++}`,
    app: gnsNetworker.name,
    bu: gnsNetworker.businessUnit,
    type: "Open Audit Findings",
    severity: "High",
    title: "Configuration compliance validation overdue for Network Guardian controls",
    age: 21,
    riskScore: 84,
  },
  {
    id: `F-${fid++}`,
    app: gnsNetworker.name,
    bu: gnsNetworker.businessUnit,
    type: "Infrastructure",
    severity: "Medium",
    title: "Incident trend indicates elevated operational instability",
    age: 7,
    riskScore: 78,
  },
);

export const copilotSuggestions = [
  "Which application has the highest compliance risk?",
  "Show risk status for GNS Networker.",
  "Why is Payments Platform high risk?",
  "Show applications likely to fail the next audit.",
  "Which applications need immediate remediation?",
  "Why is device RTR-102 unhealthy?",
  "Explain the AI prediction.",
  "Generate executive summary.",
  "Recommend remediation for Payments API.",
  "Show applications with expiring certificates.",
  "Which teams should prioritize remediation?",
];

export function copilotReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("gns") || p.includes("networker"))
    return `**GNS Networker** is a **Tier 1 Critical** Network Infrastructure application with a **92%** predictive risk score and **68%** compliance score.\n\nAI predicts elevated operational risk due to **certificates expiring in 18 days**, **3 open incidents**, and **7 unresolved vulnerabilities**.\n\n**Recommended action:** Renew certificates, validate configuration compliance, and review incident trends. Without remediation, the application is forecasted to become non-compliant within **30 days**.`;
  if (p.includes("rtr") || p.includes("device") || p.includes("unhealthy"))
    return `**Device RTR-102** — degraded on Payments Platform.\n\nRoot cause (AI): firmware **9.3.11** matches vendor advisory CSCwd12345 — BGP flap under sustained load.\n\n**Recommendation:** upgrade to 9.3.14 in the next maintenance window. Predicted failure probability drops **62% → 14%**. Open the Operational Workspace → Devices to schedule.`;
  if (p.includes("why") && (p.includes("payments") || p.includes("high risk")))
    return `**Why Payments Platform is high risk:**\n\n- 3 unresolved Veracode critical findings (weight 32%)\n- TLS certificate expires in 12 days (weight 24%)\n- DR test overdue by 47 days (weight 18%)\n- Repeated failed deployments (weight 14%)\n\nCombined predicted audit-failure probability: **92%**. Highest-impact remediation: fix the top-5 Veracode findings (-22%).`;
  if (p.includes("highest") && (p.includes("risk") || p.includes("compliance")))
    return `**Highest compliance risk today:** Payments Platform (92% predicted failure).\n\nRunners-up:\n- Trade Engine — 88%\n- Fraud Detection — 81%\n\nAll three are Tier-1 with regulatory exposure across SOX and PCI-DSS.`;
  if (p.includes("explain") && p.includes("prediction"))
    return `The forecaster correlates 24 signal sources per application: Veracode severity, ACM drift, DR posture, certificate age, deployment stability, dependency EOL, secrets exposure, cloud misconfig, incident velocity, and 15 more. Each signal is weighted by historical audit outcomes. Explanations are rendered per-app in **AI Risk Prediction → Why?**`;
  if (p.includes("immediate") || p.includes("remediation") && !p.includes("payments"))
    return `**Applications needing immediate remediation (next 14 days):**\n\n1. Payments Platform — 3 actions, -41% risk\n2. Trade Engine — 2 actions, -33% risk\n3. Fraud Detection — 4 actions, -28% risk\n4. Mobile Banking — 2 actions, -19% risk\n\nI can generate ServiceNow change requests for all of them.`;
  if (p.includes("audit"))
    return `Based on correlated signals across Veracode, ACM, DR, and certificate telemetry, **9 applications** are on track to fail the next audit cycle. The top 3 are:\n\n1. **Payments API** — 92% predicted failure probability\n2. **Trade Engine** — 88% probability, DR overdue + critical Veracode\n3. **Fraud Detection** — 81% probability, expiring certs + ACM drift\n\nRecommended focus: remediate Payments API within 10 days to reduce enterprise risk by ~14%.`;
  if (p.includes("certificate"))
    return `**8 applications** have certificates expiring within 30 days.\n\n- Payments API — 12 days\n- Fraud Detection — 16 days\n- Mobile Banking — 21 days\n- Trade Engine — 24 days\n\nI can auto-generate ServiceNow change requests for all of them. Shall I proceed?`;
  if (p.includes("summarize") || p.includes("executive summary"))
    return `**Executive summary (auto-generated):**\n\n- Enterprise Compliance Score: **96%** (▲2 MoM)\n- Applications at Risk: **67** (▼9)\n- Predicted Audit Failures: **9**\n- Top Business Risk: Retail Banking — Payments Platform\n\nAI confidence: 97%. Full pack available in Executive Reports.`;
  if (p.includes("report"))
    return `Drafting executive compliance report...\n\n**Enterprise Compliance Score:** 96% (▲ 2 pts MoM)\n**Applications at Risk:** 67 (▼ 9)\n**Predicted Audit Failures:** 9\n**Top Business Risk:** Retail Banking — Payments API\n\nReport ready to export as PDF or PowerPoint from the Executive Reports page.`;
  if (p.includes("team") || p.includes("priorit"))
    return `Recommended remediation priority by team:\n\n1. **Retail Banking Platform Team** — Payments API, Mobile Banking\n2. **Investment Banking Eng** — Trade Engine, Settlement Engine\n3. **Security Engineering** — Fraud Detection, AML Screening\n\nEstimated combined risk reduction: **41%** if actioned this sprint.`;
  if (p.includes("payments api") || (p.includes("recommend") && p.includes("payments")))
    return `**Remediation plan — Payments API:**\n\n1. Fix top-5 Veracode critical findings (impact: -22%)\n2. Renew payments-api.prod TLS certificate (impact: -12%)\n3. Complete DR validation (impact: -15%)\n\nCombined predicted risk reduction: **~41%** within 10 days.`;
  if (p.includes("jira"))
    return `Generated 14 Jira tickets across 5 projects. Preview:\n\n- **PAY-2314** Fix top-5 Veracode critical findings\n- **PAY-2315** Renew payments-api.prod TLS certificate\n- **TRE-881** Complete DR validation\n\nAll tickets tagged \`compliance-copilot\` and linked to source findings.`;
  if (p.includes("servicenow") || p.includes("change"))
    return `Drafted ServiceNow standard change **CHG0043211**:\n\n- **Application:** Payments API\n- **Type:** Certificate renewal (standard)\n- **Risk:** Low\n- **Window:** Sat 02:00–04:00 UTC\n- **Backout:** Automated rollback via pipeline\n\nReady for CAB submission.`;
  if (p.includes("cab"))
    return `**CAB recommendation for Thursday:**\n\n✅ Approve — 6 low-risk certificate renewals\n⚠️ Discuss — Trade Engine DR failover (elevated but necessary)\n❌ Defer — Wealth Portal library upgrade (insufficient testing evidence)\n\nOverall risk-adjusted throughput: **+18%** vs last week.`;
  return `I've analyzed your request against the compliance signal graph. I can help you predict audit risk, explain individual predictions, investigate device health, or draft executive reports. Try one of the suggested prompts to see structured output.`;
}
