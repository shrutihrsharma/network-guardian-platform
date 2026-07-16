import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { GlassCard, RiskBadge, SectionHeader } from "@/components/ui-kit";
import {
  complianceDistribution,
  complianceTrend,
  heatmap,
  kpis,
  pendingApprovals,
  recentDecisions,
  recommendations,
  upcomingAudits,
} from "@/lib/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — Compliance Sentinel AI" },
      {
        name: "description",
        content:
          "Real-time enterprise compliance posture, predicted audit risk, and AI-driven recommendations.",
      },
    ],
  }),
  component: Dashboard,
});

const kpiCards = [
  {
    label: "Enterprise Compliance Score",
    value: `${kpis.complianceScore}%`,
    delta: "+2.1 MoM",
    accent: "gold",
    icon: ShieldCheck,
  },
  {
    label: "Applications Monitored",
    value: kpis.applicationsMonitored.toLocaleString(),
    delta: "+18 this week",
    icon: Activity,
  },
  {
    label: "Applications At Risk",
    value: kpis.applicationsAtRisk,
    delta: "-9 vs last week",
    icon: ShieldAlert,
    tone: "warning",
  },
  {
    label: "Critical Risks",
    value: kpis.criticalRisks,
    delta: "3 new today",
    icon: AlertTriangle,
    tone: "danger",
  },
  {
    label: "Predicted Audit Failures",
    value: kpis.predictedAuditFailures,
    delta: "Next 30 days",
    icon: TrendingUp,
    tone: "warning",
  },
  {
    label: "Avg. AI Confidence",
    value: `${kpis.avgAiConfidence}%`,
    delta: "cic-forecaster v4.1",
    icon: Brain,
    accent: "gold",
  },
];

function Dashboard() {
  return (
    <>
      <TopBar
        title="Executive Dashboard"
        subtitle="Predict. Prevent. Prioritize. — Enterprise compliance posture, live."
      />

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <GlassCard className="p-4 h-full relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div
                    className={`h-8 w-8 grid place-items-center rounded-lg ${
                      k.accent === "gold"
                        ? "gold-gradient text-primary-foreground"
                        : k.tone === "danger"
                          ? "bg-danger/15 text-danger"
                          : k.tone === "warning"
                            ? "bg-warning/15 text-warning"
                            : "bg-info/15 text-info"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-4 text-[11px] text-muted-foreground leading-tight">
                  {k.label}
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {k.value}
                </div>
                <div className="mt-1 text-[10.5px] text-muted-foreground">{k.delta}</div>
                <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/[0.05] blur-2xl" />
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="p-5 xl:col-span-2">
          <SectionHeader
            title="Compliance & Risk Trend"
            hint="Rolling 12 months · enterprise-wide"
            action={
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Compliance
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-danger" /> Risk Index
                </span>
              </div>
            }
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complianceTrend} margin={{ left: -10, right: 6, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="gGold" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRisk" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.22 25)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.65 0.22 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.35 0.03 260 / 0.4)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.7 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0.03 260 / 0.95)",
                    border: "1px solid oklch(0.4 0.03 260 / 0.5)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="oklch(0.82 0.14 88)" strokeWidth={2.5} fill="url(#gGold)" />
                <Area type="monotone" dataKey="risk" stroke="oklch(0.65 0.22 25)" strokeWidth={2} fill="url(#gRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Compliance Distribution" hint="Across 1,284 apps" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceDistribution}
                  innerRadius={54}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {complianceDistribution.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0.03 260 / 0.95)",
                    border: "1px solid oklch(0.4 0.03 260 / 0.5)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {complianceDistribution.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-foreground font-medium">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <SectionHeader title="Upcoming Audit Timeline" hint="Next 90 days" />
          <div className="space-y-3">
            {upcomingAudits.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg grid place-items-center bg-primary/10 text-primary text-[11px] font-semibold">
                  {a.date.split(" ")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.date} · {a.days} days out</div>
                </div>
                <RiskBadge level={a.severity as any} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 xl:col-span-2">
          <SectionHeader title="Risk Heatmap" hint="Business unit × compliance domain" />
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-normal py-1.5 pr-3">Business Unit</th>
                  {heatmap[0].values.map((v) => (
                    <th key={v.cat} className="text-center font-normal px-1">
                      {v.cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row) => (
                  <tr key={row.bu}>
                    <td className="py-1.5 pr-3 text-foreground/90 whitespace-nowrap">{row.bu}</td>
                    {row.values.map((c) => {
                      const intensity = c.value / 100;
                      const tone =
                        c.value > 70 ? "255,120,120" : c.value > 45 ? "255,196,120" : "150,220,180";
                      return (
                        <td key={c.cat} className="px-1 py-1">
                          <div
                            className="h-8 rounded-md grid place-items-center text-[10.5px] font-medium text-foreground/90 border border-white/5"
                            style={{
                              background: `rgba(${tone}, ${0.14 + intensity * 0.45})`,
                            }}
                          >
                            {c.value}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <SectionHeader
            title="Recent AI Decisions"
            action={<Sparkles className="h-3.5 w-3.5 text-primary" />}
          />
          <div className="space-y-2.5">
            {recentDecisions.map((d) => (
              <div key={d.id} className="p-3 rounded-lg bg-white/[0.02] border border-border/30">
                <div className="text-sm text-foreground">{d.title}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Confidence {d.confidence}%</span>
                  <span className="text-primary/90">{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Recent Recommendations" />
          <div className="space-y-2.5">
            {recommendations.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-white/[0.02] border border-border/30">
                <div className="text-sm text-foreground">{r.title}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{r.impact}</div>
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full gold-gradient" style={{ width: `${r.risk}%` }} />
                </div>
                <div className="mt-1 text-[10.5px] text-muted-foreground text-right">
                  Risk reduction {r.risk}%
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader
            title="Pending Approvals"
            action={<span className="text-[10.5px] text-primary">3 items</span>}
          />
          <div className="space-y-2.5">
            {pendingApprovals.map((p) => (
              <div key={p.id} className="p-3 rounded-lg bg-white/[0.02] border border-border/30">
                <div className="text-sm text-foreground">{p.title}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {p.requester} · effort {p.effort}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button className="text-[11px] gold-gradient text-primary-foreground rounded-md px-2.5 py-1 font-medium">
                    Approve
                  </button>
                  <button className="text-[11px] border border-border/50 rounded-md px-2.5 py-1 text-muted-foreground hover:text-foreground">
                    Reject
                  </button>
                  <span className="ml-auto text-[10.5px] text-muted-foreground">
                    AI {p.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="p-5 xl:col-span-2" strong>
          <SectionHeader
            title="Executive Summary"
            hint="Generated by cic-forecaster · updated 3 min ago"
            action={
              <button className="text-[11px] flex items-center gap-1 text-primary hover:underline">
                Full report <ChevronRight className="h-3 w-3" />
              </button>
            }
          />
          <p className="text-sm text-foreground/85 leading-relaxed">
            Enterprise compliance posture is <span className="text-gold-gradient font-semibold">healthy at 96%</span>,
            up 2 points month-over-month. However, the model predicts <span className="text-danger font-medium">9 audit
            failures within 30 days</span>, concentrated in Retail Banking (Payments API, Mobile Banking) and
            Investment Banking (Trade Engine). Combined remediation of the top three applications is expected to reduce
            enterprise audit-failure probability by <span className="text-primary font-semibold">41%</span> and unblock
            two Tier-1 releases pending CAB approval.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Predicted risk reduction", value: "41%", tone: "text-primary" },
              { label: "Estimated engineering effort", value: "18 sprints", tone: "text-foreground" },
              { label: "Business impact if inaction", value: "€ 14.2M", tone: "text-danger" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-lg bg-white/[0.02] border border-border/30">
                <div className="text-[10.5px] text-muted-foreground">{s.label}</div>
                <div className={`mt-1 text-lg font-semibold ${s.tone}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Platform Health" hint="All systems operational" />
          <div className="space-y-3">
            {[
              { label: "Signal ingestion", value: "99.98%", ok: true },
              { label: "Model inference latency", value: "82 ms", ok: true },
              { label: "Data source coverage", value: "24 / 24", ok: true },
              { label: "Last full retrain", value: "6h ago", ok: true },
            ].map((h) => (
              <div key={h.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  {h.label}
                </div>
                <div className="text-foreground font-medium">{h.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complianceTrend.slice(-8)}>
                <Area type="monotone" dataKey="score" stroke="oklch(0.72 0.16 155)" fill="oklch(0.72 0.16 155 / 0.2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
