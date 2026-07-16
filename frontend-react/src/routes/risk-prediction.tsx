import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

import { TopBar } from "@/components/TopBar";
import { GlassCard, RiskBadge } from "@/components/ui-kit";
import { applications } from "@/lib/mockData";

export const Route = createFileRoute("/risk-prediction")({
  head: () => ({
    meta: [
      { title: "AI Risk Prediction — Compliance Sentinel AI" },
      {
        name: "description",
        content: "Forward-looking, explainable AI predictions of compliance risk across enterprise applications.",
      },
    ],
  }),
  component: RiskPredictionPage,
});

function RiskPredictionPage() {
  const top = [...applications].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);
  const [expanded, setExpanded] = useState<string | null>(top[0]?.id ?? null);

  return (
    <>
      <TopBar
        title="AI Risk Prediction"
        subtitle="Forward-looking risk forecasts with explainable AI reasoning · next 30 days"
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {top.map((app, i) => {
          const isOpen = expanded === app.id;
          const forecastData = Array.from({ length: 30 }, (_, d) => ({
            d,
            r: Math.max(
              10,
              Math.round(
                app.riskScore * 0.55 + (Math.sin(d / 4 + i) + 1) * 10 + (d / 30) * (app.riskScore * 0.45),
              ),
            ),
          }));
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="flex items-start justify-between relative">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                      {app.businessUnit} · {app.criticality}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{app.name}</h3>
                  </div>
                  <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                    <Brain className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10.5px] text-muted-foreground">Current</div>
                    <div className="mt-1"><RiskBadge level={app.currentRisk} /></div>
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10.5px] text-muted-foreground">Predicted</div>
                    <div className="mt-1"><RiskBadge level={app.predictedRisk} /></div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-border/40 flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0">
                    <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
                      <circle cx="20" cy="20" r="16" stroke="oklch(0.3 0.03 260)" strokeWidth="4" fill="none" />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="oklch(0.82 0.14 88)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(app.probability / 100) * 100.53} 100.53`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-foreground">
                      {app.probability}%
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Failure probability</div>
                    <div className="text-sm text-foreground">
                      AI Confidence <span className="text-gold-gradient font-semibold">{app.aiConfidence}%</span>
                    </div>
                    <div className="text-[10.5px] text-muted-foreground mt-0.5">
                      Est. reduction if actioned: <span className="text-success">−{app.estimatedReduction}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData} margin={{ left: -20, right: 0, top: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`gRisk-${app.id}`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="d" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.2 0.03 260 / 0.95)",
                          border: "1px solid oklch(0.4 0.03 260 / 0.5)",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                        labelFormatter={(l) => `Day +${l}`}
                        formatter={(v) => [`${v}`, "Risk"]}
                      />
                      <Area type="monotone" dataKey="r" stroke="oklch(0.82 0.14 88)" strokeWidth={2} fill={`url(#gRisk-${app.id})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <button
                  onClick={() => setExpanded(isOpen ? null : app.id)}
                  className="mt-3 w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {isOpen ? "Hide" : "Show"} explainability & actions
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 space-y-3"
                  >
                    <div>
                      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Why?
                      </div>
                      <ul className="space-y-1.5">
                        {app.reasons.map((r) => (
                          <li key={r} className="text-xs text-foreground/90 flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Recommended Actions
                      </div>
                      <ul className="space-y-1.5">
                        {app.actions.map((a) => (
                          <li key={a.label} className="text-xs flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-border/30">
                            <span className="text-foreground/90">{a.label}</span>
                            <span className="text-success text-[11px]">−{a.impact}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg gold-gradient text-primary-foreground flex items-center justify-between">
                      <div className="text-[11px] font-medium flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Estimated Risk Reduction
                      </div>
                      <div className="text-lg font-bold">−{app.estimatedReduction}%</div>
                    </div>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
