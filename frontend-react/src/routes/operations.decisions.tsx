import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader } from "@/components/ui-kit";
import { decisionHistory, getSelectedAppId } from "@/lib/opsData";

export const Route = createFileRoute("/operations/decisions")({
  component: OpsDecisionsPage,
});

function OpsDecisionsPage() {
  const [appId, setAppId] = useState("");
  useEffect(() => setAppId(getSelectedAppId()), []);
  if (!appId) return null;
  const rows = decisionHistory(appId);

  return (
    <div className="mt-6 space-y-4">
      <GlassCard className="p-5">
        <SectionHeader title="Decision history & audit trail" hint="AI recommendations, engineer decisions and manual overrides" />
        <div className="space-y-2.5">
          {rows.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-white/[0.02] border border-border/30 flex items-center gap-4">
              <div className="w-32 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  d.kind.includes("AI") ? "border-primary/40 text-primary bg-primary/10" :
                  d.kind.includes("Override") ? "border-warning/40 text-warning bg-warning/10" :
                  "border-info/40 text-info bg-info/10"
                }`}>{d.kind}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{d.action}</div>
                <div className="text-[11px] text-muted-foreground">{d.id} · by {d.actor}</div>
              </div>
              <div className="text-right text-[11px]">
                <div className="text-foreground/80">Confidence {d.confidence}%</div>
                <div className="text-muted-foreground">{d.ts}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
