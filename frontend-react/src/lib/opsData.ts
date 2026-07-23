import { applications } from "./mockData";

export type OpsApp = {
  id: string;
  name: string;
  owner: string;
  bu: string;
};

export const opsApps: OpsApp[] = applications.map((a) => ({
  id: a.id,
  name: a.name,
  owner: a.owner,
  bu: a.businessUnit,
}));

const APP_KEY = "cs-ops-app";

export function getSelectedAppId(): string {
  if (typeof window === "undefined") return opsApps[0].id;
  return localStorage.getItem(APP_KEY) || opsApps[0].id;
}

export function setSelectedAppId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_KEY, id);
}

export function getApp(id: string): OpsApp {
  return opsApps.find((a) => a.id === id) || opsApps[0];
}

// Deterministic pseudo-random per app
function seed(str: string, salt: number) {
  let h = salt;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return (h & 0xffff) / 0xffff;
  };
}

export function opsMetrics(appId: string) {
  const app = getApp(appId);
  if (app.name === "GNS Networker") {
    return {
      health: 74,
      availability: 98.6,
      openIncidents: 3,
      compliance: 68,
      deviceCount: 184,
      failureProb: 92,
      certsExpiring: 1,
      driftItems: 6,
      eosCount: 2,
      eolCount: 1,
      patchCoverage: 81,
    };
  }
  const r = seed(appId, 7);
  return {
    health: 72 + Math.floor(r() * 25),
    availability: 98 + r() * 1.9,
    openIncidents: Math.floor(r() * 14) + 1,
    compliance: 74 + Math.floor(r() * 22),
    deviceCount: 120 + Math.floor(r() * 380),
    failureProb: Math.floor(r() * 55) + 15,
    certsExpiring: Math.floor(r() * 8) + 1,
    driftItems: Math.floor(r() * 12) + 2,
    eosCount: Math.floor(r() * 9),
    eolCount: Math.floor(r() * 5),
    patchCoverage: 78 + Math.floor(r() * 20),
  };
}

export function deviceInventory(appId: string) {
  const r = seed(appId, 42);
  const types = ["Router", "Switch", "Firewall", "Load Balancer", "Server", "Storage"];
  const vendors = ["Cisco", "Juniper", "Palo Alto", "F5", "Dell", "HPE", "Arista"];
  const status = ["Healthy", "Degraded", "At Risk", "Healthy", "Healthy"];
  return Array.from({ length: 14 }).map((_, i) => ({
    id: `${appId.slice(0, 3).toUpperCase()}-${String(100 + i)}`,
    name: `${["RTR", "SW", "FW", "LB", "SRV", "STG"][i % 6]}-${100 + i}`,
    type: types[i % types.length],
    vendor: vendors[i % vendors.length],
    firmware: `${8 + Math.floor(r() * 6)}.${Math.floor(r() * 9)}.${Math.floor(r() * 20)}`,
    status: status[Math.floor(r() * status.length)],
    certExpiryDays: Math.floor(r() * 180) - 10,
    eosDate: `202${5 + Math.floor(r() * 4)}-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-15`,
    patch: r() > 0.3 ? "Current" : "Outdated",
    lastSeen: `${Math.floor(r() * 60)}m ago`,
  }));
}

export function incidents(appId: string) {
  const app = getApp(appId);
  if (app.name === "GNS Networker") {
    return [
      {
        id: "INC18421",
        title: "Certificate handshake failure on automation gateway",
        severity: "High" as const,
        open: true,
        affected: 6,
        rootCause: "AI: Expiring TLS certificate correlated with repeated gateway authentication failures across network automation nodes",
        opened: "4h ago",
      },
      {
        id: "INC18422",
        title: "Configuration drift detected on edge orchestration cluster",
        severity: "Medium" as const,
        open: true,
        affected: 3,
        rootCause: "AI: Baseline mismatch introduced during recent policy rollout in the private cloud environment",
        opened: "19h ago",
      },
      {
        id: "INC18423",
        title: "Recurring latency spike in network compliance validation service",
        severity: "Medium" as const,
        open: true,
        affected: 4,
        rootCause: "AI: Incident trend suggests resource contention during compliance scans on shared private cloud workers",
        opened: "31h ago",
      },
    ];
  }
  const r = seed(appId, 91);
  const sev = ["Critical", "High", "Medium", "Low"] as const;
  const causes = [
    "Certificate handshake failure",
    "Config drift on edge firewall",
    "BGP session flap",
    "Firmware bug (vendor advisory)",
    "Capacity exhaustion",
    "Auth service latency spike",
    "Storage IOPS saturation",
  ];
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `INC${10000 + Math.floor(r() * 8999)}`,
    title: causes[i % causes.length],
    severity: sev[Math.min(3, Math.floor(r() * 4))],
    open: r() > 0.4,
    affected: Math.floor(r() * 24) + 1,
    rootCause: `AI: ${causes[(i + 2) % causes.length]} — correlated across ${Math.floor(r() * 5) + 2} nodes`,
    opened: `${Math.floor(r() * 72)}h ago`,
  }));
}

export function lifecycleItems(appId: string) {
  const app = getApp(appId);
  if (app.name === "GNS Networker") {
    return [
      { asset: "GNS-Gateway-01", eos: "2027-Q2", eol: "2029-Q1", patch: "Current", cert: 18, action: "Renew certificate" },
      { asset: "GNS-Orchestrator-02", eos: "2026-Q4", eol: "2028-Q2", patch: "Behind", cert: 42, action: "Patch and validate config" },
      { asset: "GNS-Policy-03", eos: "2027-Q1", eol: "2029-Q3", patch: "Current", cert: 64, action: "Monitor incident trend" },
    ];
  }
  const r = seed(appId, 21);
  return Array.from({ length: 10 }).map((_, i) => ({
    asset: `Device-${100 + i}`,
    eos: `202${5 + Math.floor(r() * 3)}-Q${1 + Math.floor(r() * 4)}`,
    eol: `202${7 + Math.floor(r() * 3)}-Q${1 + Math.floor(r() * 4)}`,
    patch: r() > 0.35 ? "Current" : "Behind",
    cert: Math.floor(r() * 200) - 20,
    action: r() > 0.5 ? "Renew / patch" : "Schedule replacement",
  }));
}

export function complianceItems(appId: string) {
  const app = getApp(appId);
  if (app.name === "GNS Networker") {
    return [
      { control: "TLS Configuration", drift: true, compliant: 61, findings: 3, severity: "High" as const },
      { control: "Firmware Version Baseline", drift: false, compliant: 79, findings: 1, severity: "Medium" as const },
      { control: "Change Management", drift: true, compliant: 66, findings: 2, severity: "High" as const },
      { control: "Access Control", drift: false, compliant: 74, findings: 1, severity: "Medium" as const },
      { control: "Vulnerability Patching", drift: true, compliant: 68, findings: 4, severity: "High" as const },
    ];
  }
  const r = seed(appId, 55);
  const controls = [
    "TLS Configuration",
    "Firmware Version Baseline",
    "Change Management",
    "Access Control",
    "Backup Verification",
    "Logging & SIEM",
    "Vulnerability Patching",
    "Configuration Baseline",
  ];
  return controls.map((c) => ({
    control: c,
    drift: r() > 0.6,
    compliant: 60 + Math.floor(r() * 40),
    findings: Math.floor(r() * 8),
    severity: (["Low", "Medium", "High", "Critical"] as const)[Math.floor(r() * 4)],
  }));
}

export function riskForecast(appId: string) {
  const app = getApp(appId);
  if (app.name === "GNS Networker") {
    return Array.from({ length: 12 }).map((_, i) => ({
      week: `W${i + 1}`,
      probability: Math.min(97, 78 + i + (i % 3) * 2),
      baseline: 44,
    }));
  }
  const r = seed(appId, 8);
  return Array.from({ length: 12 }).map((_, i) => ({
    week: `W${i + 1}`,
    probability: Math.min(95, Math.floor(20 + r() * 60 + i * 1.4)),
    baseline: 30 + Math.floor(r() * 10),
  }));
}

export function decisionHistory(appId: string) {
  const r = seed(appId, 3);
  const kinds = [
    "AI Recommendation",
    "Engineer Decision",
    "Manual Override",
    "AI Recommendation",
    "Auto-approved",
  ];
  const actions = [
    "Renew TLS cert on RTR-104",
    "Patch firmware on FW-102",
    "Failover to secondary LB",
    "Isolate node from cluster",
    "Approve config baseline drift",
    "Reject deploy — DR pending",
  ];
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `DEC-${2000 + i}`,
    kind: kinds[i % kinds.length],
    action: actions[i % actions.length],
    actor: i % 3 === 0 ? "cic-forecaster" : ["J. Moreau", "R. Kowalski", "A. Patel"][i % 3],
    confidence: 78 + Math.floor(r() * 22),
    ts: `${Math.floor(r() * 30) + 1}d ago`,
  }));
}

export function opsCopilotReply(prompt: string, appName: string) {
  const p = prompt.toLowerCase();
  if (appName === "GNS Networker" && (p.includes("remediation") || p.includes("recommend") || p.includes("prediction") || p.includes("risk")))
    return `AI predicts elevated operational risk for **GNS Networker** due to expiring certificates and recent incident trends. Immediate certificate renewal and compliance validation are recommended.\n\nCurrent indicators:\n- Predictive risk: **92%**\n- Compliance score: **68%**\n- Certificate expiry: **18 days**\n- Open incidents: **3**\n- Open vulnerabilities: **7**`;
  if (p.includes("rtr") || p.includes("device") || p.includes("unhealthy"))
    return `**Device RTR-102** — degraded state detected on ${appName}.\n\nAI root-cause: firmware **9.3.11** matches vendor advisory CSCwd12345 (BGP flap under sustained load).\n\n**Recommendation:** schedule firmware upgrade to 9.3.14 in the next maintenance window. Predicted failure probability drops **62% → 14%**.`;
  if (p.includes("prediction") || p.includes("explain"))
    return `The AI model correlates 6 signals for ${appName}: certificate age, firmware drift, config drift score, incident velocity, patch coverage, and vendor advisories. Current failure probability is driven mostly by **certificate expiry (38%)** and **firmware drift (27%)**.`;
  if (p.includes("remediation") || p.includes("recommend"))
    return `Recommended actions for ${appName}:\n\n1. Renew 3 expiring certificates (impact: -22%)\n2. Patch firmware on 4 edge devices (impact: -18%)\n3. Close 2 open config drift items (impact: -9%)\n\nCombined predicted risk reduction: **~41%** within 14 days.`;
  return `Analyzing ${appName} across ${Math.floor(Math.random() * 20) + 120} operational signals. Try asking about device health, root cause, or remediation.`;
}
