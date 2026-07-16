import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, X } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/ui-kit";

export const Route = createFileRoute("/decisions")({
  head: () => ({
    meta: [
      { title: "Decision Center — Compliance Sentinel AI" },
      { name: "description", content: "AI-generated recommendations awaiting human approval." },
    ],
  }),
  component: DecisionsPage,
});

const initial = [
  {
    id: 1,
    title: "Auto-remediate 8 expiring TLS certificates",
    apps: ["Payments API", "Mobile Banking", "Fraud Detection"],
    reduction: 24,
    effort: "Low",
    hours: 4,
    confidence: 98,
    explanation:
      "Certificates renewed via standard pipeline. Historical success rate 99.4%. Failure blast radius contained by automated rollback.",
    impact: "Prevents 3 predicted service outages, unblocks 2 CAB items.",
  },
  {
    id: 2,
    title: "Escalate Trade Engine to Tier-1 remediation queue",
    apps: ["Trade Engine"],
    reduction: 41,
    effort: "High",
    hours: 96,
    confidence: 92,
    explanation:
      "Correlated signals across Veracode critical, DR overdue, ACM drift. Model detects failure pattern matching 3 past audit findings.",
    impact: "Reduces predicted audit failure probability from 88% to 47%.",
  },
  {
    id: 3,
    title: "Grant compliance exception — Wealth Portal library upgrade",
    apps: ["Wealth Portal"],
    reduction: 6,
    effort: "Medium",
    hours: 16,
    confidence: 74,
    explanation:
      "Business justification acceptable but testing evidence marginal. Recommend 90-day time-bound exception with quarterly review.",
    impact: "Unblocks Q4 feature release valued at €2.1M.",
  },
  {
    id: 4,
    title: "Consolidate secrets rotation across 14 apps",
    apps: ["Ledger Core", "FX Trading", "AML Screening"],
    reduction: 18,
    effort: "Medium",
    hours: 32,
    confidence: 95,
    explanation:
      "Standardization removes 6 recurring findings and reduces mean time to rotate by 62%.",
    impact: "Closes 22 open findings, reduces audit prep effort by ~30%.",
  },
];

type Status = "pending" | "approved" | "rejected";

function DecisionsPage() {
  const [state, setState] = useState<Record<number, Status>>({});
  const [selected, setSelected] = useState<number>(initial[0].id);

  const active = initial.find((d) => d.id === selected)!;

  return (
    <>
      <TopBar title="Decision Center" subtitle="AI recommendations awaiting your approval · human-in-the-loop" />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4">
        <div className="space-y-3">
          {initial.map((d) => {
            const s = state[d.id] ?? "pending";
            const isSel = selected === d.id;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => setSelected(d.id)}
                className={`cursor-pointer rounded-2xl p-4 transition-all ${
                  isSel ? "glass-strong ring-gold" : "glass hover:border-primary/25"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl gold-gradient grid place-items-center text-primary-foreground text-xs font-bold shrink-0">
                    AI
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{d.title}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {d.apps.join(" · ")}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                      <Stat label="Risk reduction" value={`−${d.reduction}%`} tone="text-success" />
                      <Stat label="Effort" value={d.effort} />
                      <Stat label="Est. hours" value={`${d.hours}h`} />
                      <Stat label="AI confidence" value={`${d.confidence}%`} tone="text-primary" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setState((x) => ({ ...x, [d.id]: "approved" }));
                      }}
                      className={`h-8 w-8 rounded-lg grid place-items-center ${
                        s === "approved" ? "bg-success text-background" : "bg-white/5 text-success hover:bg-success/20"
                      }`}
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setState((x) => ({ ...x, [d.id]: "rejected" }));
                      }}
                      className={`h-8 w-8 rounded-lg grid place-items-center ${
                        s === "rejected" ? "bg-danger text-background" : "bg-white/5 text-danger hover:bg-danger/20"
                      }`}
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {s !== "pending" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-3 text-[11px] px-3 py-1.5 rounded-md ${
                        s === "approved"
                          ? "bg-success/10 text-success border border-success/30"
                          : "bg-danger/10 text-danger border border-danger/30"
                      }`}
                    >
                      {s === "approved" ? "Approved — routed to change management" : "Rejected — logged with audit trail"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <GlassCard className="p-5 h-fit sticky top-24" strong>
          <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-primary mb-2">
            <Info className="h-3 w-3" /> AI Explanation
          </div>
          <div className="text-lg font-semibold text-foreground">{active.title}</div>
          <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{active.explanation}</p>
          <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-border/40">
            <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mb-1">Business Impact</div>
            <div className="text-sm text-foreground/90">{active.impact}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-border/40">
              <div className="text-[10.5px] text-muted-foreground">Confidence</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full gold-gradient" style={{ width: `${active.confidence}%` }} />
                </div>
                <span className="text-sm text-foreground font-medium">{active.confidence}%</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-border/40">
              <div className="text-[10.5px] text-muted-foreground">Est. Risk Reduction</div>
              <div className="mt-1 text-lg font-semibold text-success">−{active.reduction}%</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <span className={tone ?? "text-foreground"}>{value}</span>
    </div>
  );
}
