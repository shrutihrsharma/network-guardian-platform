import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Search, SlidersHorizontal, ChevronRight, Network } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { GlassCard, RiskBadge } from "@/components/ui-kit";
import { applications, businessUnits } from "@/lib/mockData";
import { setSelectedAppId } from "@/lib/opsData";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Application Inventory — Compliance Sentinel AI" },
      { name: "description", content: "Searchable inventory of monitored enterprise applications." },
    ],
  }),
  component: ApplicationsPage,
});

type SortKey = "name" | "riskScore" | "currentCompliance" | "predictedCompliance" | "aiConfidence";

function ApplicationsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [bu, setBu] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("riskScore");
  const [dir, setDir] = useState<1 | -1>(-1);

  const openOps = (id: string) => {
    setSelectedAppId(id);
    navigate({ to: "/operations" });
  };

  const rows = useMemo(() => {
    let r = applications.filter(
      (a) =>
        (bu === "All" || a.businessUnit === bu) &&
        (query === "" ||
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.owner.toLowerCase().includes(query.toLowerCase())),
    );
    r = [...r].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (typeof av === "string") return dir * av.localeCompare(bv as string);
      return dir * ((av as number) - (bv as number));
    });
    return r;
  }, [query, bu, sort, dir]);

  const toggle = (k: SortKey) => {
    if (sort === k) setDir((d) => (d === 1 ? -1 : 1));
    else {
      setSort(k);
      setDir(-1);
    }
  };

  return (
    <>
      <TopBar
        title="Application Inventory"
        subtitle="1,284 monitored applications across 6 business units"
      />

      <GlassCard className="mt-6 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-border/40 min-w-[240px] flex-1">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search application or owner…"
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/70"
            />
          </div>
          <select
            value={bu}
            onChange={(e) => setBu(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[0.03] border border-border/40 text-sm outline-none"
          >
            <option>All</option>
            {businessUnits.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <button className="px-3 py-2 rounded-lg glass text-xs flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </GlassCard>

      <GlassCard className="mt-4 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                {[
                  ["name", "Application"],
                  ["businessUnit", "Business Unit"],
                  ["criticality", "Criticality"],
                  ["owner", "Owner"],
                  ["currentCompliance", "Current"],
                  ["predictedCompliance", "Predicted"],
                  ["aiConfidence", "AI Conf."],
                  ["riskScore", "Risk"],
                  ["lastScan", "Last Scan"],
                  ["", ""],
                ].map(([k, label]) => (
                  <th key={label as string} className="text-left font-medium px-4 py-3">
                    {k ? (
                      <button
                        onClick={() => toggle(k as SortKey)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {label}
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/25 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center text-[11px] font-semibold">
                        {a.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-foreground font-medium">{a.name}</div>
                        <div className="text-[10.5px] text-muted-foreground">{a.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.businessUnit}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10.5px] rounded-full border border-border/50 px-2 py-0.5 text-foreground/90">
                      {a.criticality}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.owner}</td>
                  <td className="px-4 py-3">
                    <ComplianceCell value={a.currentCompliance} />
                  </td>
                  <td className="px-4 py-3">
                    <ComplianceCell value={a.predictedCompliance} predicted />
                  </td>
                  <td className="px-4 py-3 text-foreground">{a.aiConfidence}%</td>
                  <td className="px-4 py-3">
                    <RiskBadge level={a.predictedRisk} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{a.lastScan}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openOps(a.id)}
                      className="text-xs text-primary flex items-center gap-1 hover:underline whitespace-nowrap"
                    >
                      <Network className="h-3 w-3" />
                      View Operational Details <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );
}

function ComplianceCell({ value, predicted }: { value: number; predicted?: boolean }) {
  const tone =
    value >= 85 ? "bg-success" : value >= 70 ? "bg-warning" : "bg-danger";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full ${tone} ${predicted ? "opacity-70" : ""}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs ${predicted ? "text-muted-foreground" : "text-foreground"}`}>{value}%</span>
    </div>
  );
}
