import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, FileText, Presentation, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/ui-kit";
import { complianceTrend } from "@/lib/mockData";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Executive Reports — Compliance Sentinel AI" },
      { name: "description", content: "Generate executive PDF and PowerPoint compliance reports." },
    ],
  }),
  component: ReportsPage,
});

const reports = [
  {
    title: "Executive Summary",
    subtitle: "Board-level compliance posture snapshot",
    pages: 12,
    updated: "3 min ago",
  },
  {
    title: "Weekly Compliance Report",
    subtitle: "Trend, movers, remediation velocity",
    pages: 24,
    updated: "Today · 09:00",
  },
  {
    title: "Top Business Risks",
    subtitle: "Ranked by predicted business impact",
    pages: 18,
    updated: "Yesterday",
  },
  {
    title: "Risk Forecast",
    subtitle: "30/60/90 day predictive outlook",
    pages: 16,
    updated: "1h ago",
  },
  {
    title: "Compliance Trend",
    subtitle: "12-month rolling posture analysis",
    pages: 22,
    updated: "6h ago",
  },
  {
    title: "AI Recommendations",
    subtitle: "Full recommendation registry & impact",
    pages: 28,
    updated: "12 min ago",
  },
];

function ReportsPage() {
  return (
    <>
      <TopBar
        title="Executive Reports"
        subtitle="AI-generated PDF & PowerPoint packs ready for board and audit distribution"
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-5 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl gold-gradient grid place-items-center text-primary-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  {r.pages} pages
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{r.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{r.subtitle}</p>

              <div className="mt-4 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={complianceTrend}>
                    <defs>
                      <linearGradient id={`g-${i}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.82 0.14 88)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="score" stroke="oklch(0.82 0.14 88)" strokeWidth={2} fill={`url(#g-${i})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-[10.5px] text-muted-foreground">Updated {r.updated}</span>
                <div className="flex items-center gap-1.5">
                  <button className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-border/40 text-foreground/90 hover:border-primary/40">
                    <Download className="h-3 w-3" /> PDF
                  </button>
                  <button className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg gold-gradient text-primary-foreground font-medium">
                    <Presentation className="h-3 w-3" /> PPT
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="mt-6 p-6" strong>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Custom Report Builder</div>
            <div className="text-xs text-muted-foreground">
              Describe what you need — the AI drafts a boardroom-ready pack.
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder="e.g. 'Retail Banking compliance readiness for the SOX Q4 audit'"
            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-border/50 text-sm outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button className="px-5 py-3 rounded-xl gold-gradient text-primary-foreground text-sm font-semibold">
            Generate Report
          </button>
        </div>
      </GlassCard>
    </>
  );
}
