import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader } from "@/components/ui-kit";
import { complianceItems, getSelectedAppId } from "@/lib/opsData";

export const Route = createFileRoute("/operations/compliance")({
  component: OpsCompliancePage,
});

function OpsCompliancePage() {
  const [appId, setAppId] = useState("");
  useEffect(() => setAppId(getSelectedAppId()), []);
  if (!appId) return null;
  const rows = complianceItems(appId);

  return (
    <div className="mt-6 space-y-4">
      <GlassCard className="p-5">
        <SectionHeader title="Configuration & policy compliance" hint="Drift and security findings across controls" />
        <div className="grid md:grid-cols-2 gap-3">
          {rows.map((r) => (
            <div key={r.control} className="p-4 rounded-xl bg-white/[0.02] border border-border/30">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">{r.control}</div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                  r.severity === "Critical" ? "border-danger/40 text-danger bg-danger/10" :
                  r.severity === "High" ? "border-warning/40 text-warning bg-warning/10" :
                  r.severity === "Medium" ? "border-info/40 text-info bg-info/10" :
                  "border-success/40 text-success bg-success/10"
                }`}>{r.severity}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full ${r.compliant >= 85 ? "bg-success" : r.compliant >= 70 ? "bg-warning" : "bg-danger"}`} style={{ width: `${r.compliant}%` }} />
                </div>
                <div className="text-xs text-foreground">{r.compliant}%</div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{r.findings} open findings</span>
                {r.drift && <span className="text-warning">Config drift detected</span>}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
