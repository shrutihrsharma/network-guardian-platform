import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard, SectionHeader } from "@/components/ui-kit";
import { getApp, getSelectedAppId, opsMetrics, riskForecast } from "@/lib/opsData";
import { Brain, Sparkles } from "lucide-react";

export const Route = createFileRoute("/operations/predictive")({
  component: PredictivePage,
});

function PredictivePage() {
  const [appId, setAppId] = useState("");
  useEffect(() => setAppId(getSelectedAppId()), []);
  if (!appId) return null;
  const app = getApp(appId);
  const m = opsMetrics(appId);
  const forecast = riskForecast(appId);

  const drivers = [
    { name: "Certificate expiry", weight: 38 },
    { name: "Firmware drift", weight: 27 },
    { name: "Config drift score", weight: 14 },
    { name: "Incident velocity", weight: 11 },
    { name: "Patch coverage", weight: 6 },
    { name: "Vendor advisories", weight: 4 },
  ];
  const actions = [
    { title: "Renew certificates on 3 devices", impact: 22 },
    { title: "Patch firmware on RTR-102 & FW-104", impact: 18 },
    { title: "Reconcile config drift on 2 firewalls", impact: 9 },
    { title: "Replace EOL storage node STG-108", impact: 6 },
  ];

  return (
    <div className="mt-6 space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeader title={`Failure probability forecast — ${app.name}`} hint="guardian-ops · 12 week horizon" />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="pop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.9 0.02 260 / 0.06)" vertical={false} />
                <XAxis dataKey="week" stroke="oklch(0.7 0.02 260 / 0.7)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.02 260 / 0.7)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.028 260 / 0.95)", border: "1px solid oklch(0.4 0.02 260 / 0.4)", borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="baseline" stroke="oklch(0.6 0.02 260)" fill="transparent" strokeDasharray="4 3" />
                <Area type="monotone" dataKey="probability" stroke="oklch(0.82 0.14 88)" strokeWidth={2} fill="url(#pop)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Current failure probability" hint="Aggregated across all monitored devices" />
          <div className="mt-2 text-center">
            <div className="text-6xl font-display font-semibold text-gold-gradient">{m.failureProb}%</div>
            <div className="mt-2 text-xs text-muted-foreground">AI confidence 94%</div>
          </div>
          <div className="mt-5 space-y-2">
            {drivers.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>{d.name}</span>
                  <span>{d.weight}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${d.weight * 2.5}%` }} className="h-full gold-gradient" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionHeader title="Recommended actions" hint="Ranked by predicted risk reduction" />
        <div className="grid md:grid-cols-2 gap-3">
          {actions.map((a) => (
            <div key={a.title} className="p-4 rounded-xl bg-primary/[0.04] border border-primary/20 flex items-center gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg gold-gradient text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{a.title}</div>
                <div className="text-[11px] text-muted-foreground">Predicted impact: -{a.impact}% failure risk</div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10">Approve</button>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionHeader title="Why this prediction?" hint="Explainability breakdown" />
        <div className="flex items-start gap-3 text-sm text-foreground/90">
          <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Guardian AI evaluated {opsMetrics(appId).deviceCount} devices across {app.name}. The current failure probability is elevated
            primarily by <span className="text-gold-gradient font-medium">certificate expiry (38%)</span> and{" "}
            <span className="text-gold-gradient font-medium">firmware drift (27%)</span>. Historical correlation shows that
            similar signal profiles preceded 3 of the last 5 incidents in this business unit.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
