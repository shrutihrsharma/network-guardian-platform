import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { GlassCard, RiskBadge } from "@/components/ui-kit";
import { businessUnits, findings } from "@/lib/mockData";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance Explorer — Compliance Sentinel AI" },
      { name: "description", content: "Aggregated compliance findings across ACM, Veracode, DR, certificates, cloud and more." },
    ],
  }),
  component: CompliancePage,
});

const types = [
  "All",
  "ACM",
  "Veracode",
  "DR",
  "Certificates",
  "Infrastructure",
  "Cloud",
  "Secrets",
  "Dependencies",
  "Open Audit Findings",
];
const severities = ["All", "Critical", "High", "Medium", "Low"];

function CompliancePage() {
  const [q, setQ] = useState("");
  const [bu, setBu] = useState("All");
  const [type, setType] = useState("All");
  const [sev, setSev] = useState("All");

  const rows = useMemo(
    () =>
      findings.filter(
        (f) =>
          (bu === "All" || f.bu === bu) &&
          (type === "All" || f.type === type) &&
          (sev === "All" || f.severity === sev) &&
          (q === "" ||
            f.app.toLowerCase().includes(q.toLowerCase()) ||
            f.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, bu, type, sev],
  );

  const totals = severities.slice(1).map((s) => ({
    s,
    n: findings.filter((f) => f.severity === s).length,
  }));

  return (
    <>
      <TopBar
        title="Compliance Explorer"
        subtitle={`${findings.length} findings across 9 compliance domains · unified view`}
      />

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {totals.map((t) => (
          <GlassCard key={t.s} className="p-4">
            <div className="text-[11px] text-muted-foreground">{t.s} findings</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-semibold text-foreground">{t.n}</div>
              <RiskBadge level={t.s as any} />
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-4 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-border/40 min-w-[220px] flex-1">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search finding or application…"
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/70"
            />
          </div>
          <FilterSelect label="Business Unit" value={bu} onChange={setBu} options={["All", ...businessUnits]} />
          <FilterSelect label="Type" value={type} onChange={setType} options={types} />
          <FilterSelect label="Severity" value={sev} onChange={setSev} options={severities} />
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-auto">
            <Filter className="h-3 w-3" /> {rows.length} results
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-4 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                {["Finding", "Application", "Business Unit", "Type", "Severity", "Age", "Risk"].map((h) => (
                  <th key={h} className="text-left font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 80).map((f) => (
                <tr key={f.id} className="border-b border-border/25 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="text-foreground">{f.title}</div>
                    <div className="text-[10.5px] text-muted-foreground">{f.id}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground/90">{f.app}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.bu}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.type}</td>
                  <td className="px-4 py-3"><RiskBadge level={f.severity} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{f.age}d</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full gold-gradient" style={{ width: `${f.riskScore}%` }} />
                      </div>
                      <span className="text-xs text-foreground">{f.riskScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-border/40 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-foreground"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
