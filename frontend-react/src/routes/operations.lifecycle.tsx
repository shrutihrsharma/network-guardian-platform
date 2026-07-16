import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader } from "@/components/ui-kit";
import { getSelectedAppId, lifecycleItems, opsMetrics } from "@/lib/opsData";

export const Route = createFileRoute("/operations/lifecycle")({
  component: LifecyclePage,
});

function LifecyclePage() {
  const [appId, setAppId] = useState("");
  useEffect(() => setAppId(getSelectedAppId()), []);
  if (!appId) return null;
  const rows = lifecycleItems(appId);
  const m = opsMetrics(appId);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { l: "Assets at EOS", v: m.eosCount, t: "text-warning" },
          { l: "Assets at EOL", v: m.eolCount, t: "text-danger" },
          { l: "Patch Coverage", v: `${m.patchCoverage}%`, t: "text-success" },
          { l: "Certificates Expiring", v: m.certsExpiring, t: "text-primary" },
        ].map((k) => (
          <GlassCard key={k.l} className="p-4">
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">{k.l}</div>
            <div className={`mt-2 text-2xl font-display font-semibold ${k.t}`}>{k.v}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        <div className="p-5 pb-2">
          <SectionHeader title="Lifecycle inventory" hint="EOS, EOL, patch and certificate posture" />
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                {["Asset", "EOS", "EOL", "Patch", "Cert Expiry", "Recommended Action"].map((h) => (
                  <th key={h} className="text-left font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.asset} className="border-b border-border/25 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-foreground font-medium">{r.asset}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.eos}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.eol}</td>
                  <td className="px-4 py-3">
                    <span className={r.patch === "Current" ? "text-success" : "text-warning"}>{r.patch}</span>
                  </td>
                  <td className={`px-4 py-3 ${r.cert < 30 ? "text-warning" : "text-muted-foreground"}`}>
                    {r.cert < 0 ? "Expired" : `${r.cert}d`}
                  </td>
                  <td className="px-4 py-3 text-primary/90">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
