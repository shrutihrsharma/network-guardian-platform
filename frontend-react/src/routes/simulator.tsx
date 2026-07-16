import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, FlaskConical, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/ui-kit";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "What-if Simulator — Compliance Sentinel AI" },
      { name: "description", content: "Interactive AI what-if simulator for compliance remediation impact." },
    ],
  }),
  component: SimulatorPage,
});

const actions = [
  { key: "veracode", label: "Fix top Veracode findings", impact: 22, effort: "8 sprint-days" },
  { key: "dr", label: "Complete DR validation", impact: 15, effort: "3 sprint-days" },
  { key: "certs", label: "Renew expiring certificates", impact: 12, effort: "1 sprint-day" },
  { key: "libs", label: "Upgrade EOL libraries", impact: 10, effort: "5 sprint-days" },
  { key: "acm", label: "Close ACM findings", impact: 9, effort: "4 sprint-days" },
];

function SimulatorPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const totalReduction = actions.reduce(
    (a, x) => (selected[x.key] ? a + x.impact : a),
    0,
  );
  const baseRisk = 92;
  const predictedRisk = Math.max(6, baseRisk - totalReduction);
  const complianceScore = Math.min(99, 62 + totalReduction);
  const businessImpact = Math.round(totalReduction * 0.32 * 10) / 10;

  const chartData = useMemo(
    () => [
      { name: "Current Risk", value: baseRisk, color: "oklch(0.65 0.22 25)" },
      { name: "Predicted Risk", value: predictedRisk, color: "oklch(0.82 0.14 88)" },
      { name: "Compliance", value: complianceScore, color: "oklch(0.72 0.16 155)" },
    ],
    [predictedRisk, complianceScore],
  );

  return (
    <>
      <TopBar
        title="What-if Simulator"
        subtitle="Model remediation strategies in real time · Payments API scenario"
      />

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center text-primary">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Scenario Actions</div>
              <div className="text-[11px] text-muted-foreground">
                Toggle to simulate impact — updates instantly
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {actions.map((a) => {
              const on = !!selected[a.key];
              return (
                <button
                  key={a.key}
                  onClick={() => setSelected((s) => ({ ...s, [a.key]: !s[a.key] }))}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    on
                      ? "bg-primary/10 border-primary/40 ring-gold"
                      : "bg-white/[0.02] border-border/40 hover:border-primary/25"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-md grid place-items-center border ${
                        on ? "gold-gradient border-transparent" : "border-border/60"
                      }`}
                    >
                      {on && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">{a.label}</div>
                      <div className="text-[10.5px] text-muted-foreground">{a.effort}</div>
                    </div>
                    <div className="text-xs text-success font-medium">−{a.impact}%</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-border/30 flex items-center gap-3 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="text-muted-foreground">
              <span className="text-foreground font-medium">AI Explanation:</span>{" "}
              {totalReduction === 0
                ? "No actions selected. Payments API remains critical, with 92% predicted audit failure probability."
                : `Selected actions correlate with historically ${totalReduction >= 30 ? "significant" : "moderate"} risk reduction. The combined effect neutralizes the top failure predictors identified by the model.`}
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Predicted Risk" value={`${predictedRisk}%`} tone="danger" delta={`−${totalReduction}%`} />
            <MetricCard label="Compliance Score" value={`${complianceScore}%`} tone="gold" delta="Estimated" />
            <MetricCard label="Business Impact" value={`€${businessImpact}M`} tone="success" delta="Avoided" />
          </div>

          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-foreground mb-3">Live Impact Model</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 24 }}>
                  <defs>
                    <linearGradient id="gBar" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="oklch(0.82 0.14 88)" />
                      <stop offset="100%" stopColor="oklch(0.72 0.13 78)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.35 0.03 260 / 0.4)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="oklch(0.7 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.85 0.008 240)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0.03 260 / 0.95)",
                      border: "1px solid oklch(0.4 0.03 260 / 0.5)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={22}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-foreground mb-3">Risk Trajectory</div>
            <div className="relative h-20 rounded-xl bg-white/[0.02] border border-border/30 overflow-hidden">
              <motion.div
                animate={{ width: `${100 - predictedRisk}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="absolute inset-y-0 left-0 gold-gradient opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-between px-4 text-xs">
                <span className="text-primary-foreground font-semibold mix-blend-difference">Safe zone</span>
                <span className="text-danger font-semibold">Audit-fail zone</span>
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full ring-4 ring-primary/40 bg-background border border-primary grid place-items-center text-[10.5px] font-bold text-primary transition-all"
                style={{ left: `calc(${100 - predictedRisk}% - 16px)` }}
              >
                {predictedRisk}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "danger" | "gold" | "success";
}) {
  const border =
    tone === "gold" ? "ring-gold" : tone === "danger" ? "border-danger/30" : "border-success/30";
  const valueTone =
    tone === "gold" ? "text-gold-gradient" : tone === "danger" ? "text-danger" : "text-success";
  return (
    <GlassCard className={`p-4 ${border}`}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-1 text-2xl font-semibold ${valueTone}`}
      >
        {value}
      </motion.div>
      <div className="text-[10.5px] text-muted-foreground">{delta}</div>
    </GlassCard>
  );
}
