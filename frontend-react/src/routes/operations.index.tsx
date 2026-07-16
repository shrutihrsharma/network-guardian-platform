import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertOctagon, ShieldCheck, Server, Sparkles, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { GlassCard, SectionHeader } from "@/components/ui-kit";
import { getApp, getSelectedAppId, opsMetrics, riskForecast, incidents } from "@/lib/opsData";

export const Route = createFileRoute("/operations/")({
  component: OpsDashboard,
});

function OpsDashboard() {
  const [appId, setAppId] = useState<string>("");
  useEffect(() => setAppId(getSelectedAppId()), []);
  if (!appId) return null;
  const app = getApp(appId);
  const m = opsMetrics(appId);
  const forecast = riskForecast(appId);
  const inc = incidents(appId).slice(0, 4);

  const kpis = [
    { label: "Overall Health", value: `${m.health}%`, icon: Activity, tone: "text-success" },
    { label: "Availability", value: `${m.availability.toFixed(2)}%`, icon: ShieldCheck, tone: "text-primary" },
    { label: "Open Incidents", value: m.openIncidents, icon: AlertOctagon, tone: "text-warning" },
    { label: "Compliance Score", value: `${m.compliance}%`, icon: ShieldCheck, tone: "text-primary" },
    { label: "Devices Monitored", value: m.deviceCount, icon: Server, tone: "text-info" },
  ];

  return (
    <div className="mt-6 space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">{k.label}</div>
                <k.icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <div className="mt-2 text-2xl font-display font-semibold text-foreground">{k.value}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-5">
          <SectionHeader
            title={`Predicted failure probability — ${app.name}`}
            hint="Guardian AI, 12 week forecast vs baseline"
            action={
              <Link to="/operations/predictive" className="text-xs text-primary flex items-center gap-1 hover:underline">
                Details <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="opsprob" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.9 0.02 260 / 0.06)" vertical={false} />
                <XAxis dataKey="week" stroke="oklch(0.7 0.02 260 / 0.7)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.02 260 / 0.7)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.028 260 / 0.95)",
                    border: "1px solid oklch(0.4 0.02 260 / 0.4)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="baseline" stroke="oklch(0.6 0.02 260)" fill="transparent" strokeDasharray="4 3" />
                <Area type="monotone" dataKey="probability" stroke="oklch(0.82 0.14 88)" strokeWidth={2} fill="url(#opsprob)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Recent incidents" hint="Correlated by Guardian AI" />
          <div className="space-y-2.5">
            {inc.map((i) => (
              <div key={i.id} className="p-3 rounded-lg bg-white/[0.02] border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-foreground">{i.title}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                    i.severity === "Critical" ? "border-danger/40 text-danger bg-danger/10" :
                    i.severity === "High" ? "border-warning/40 text-warning bg-warning/10" :
                    "border-info/40 text-info bg-info/10"
                  }`}>{i.severity}</span>
                </div>
                <div className="text-[10.5px] text-muted-foreground mt-1">{i.id} · {i.affected} systems · {i.opened}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionHeader
          title="AI recommendations"
          hint="Suggested by guardian-ops model"
          action={
            <Link to="/operations/predictive" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        />
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { title: `Renew ${m.certsExpiring} TLS certificates`, impact: "-22% failure risk" },
            { title: `Patch ${m.driftItems} drift items`, impact: "-9% failure risk" },
            { title: `Upgrade firmware on ${Math.min(6, m.eosCount + 2)} devices`, impact: "-18% failure risk" },
          ].map((r) => (
            <div key={r.title} className="p-4 rounded-lg bg-primary/[0.04] border border-primary/20">
              <div className="flex items-center gap-2 text-xs text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Action
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">{r.title}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Predicted impact: {r.impact}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
