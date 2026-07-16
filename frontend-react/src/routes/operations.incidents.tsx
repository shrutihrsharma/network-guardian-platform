import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader } from "@/components/ui-kit";
import { getSelectedAppId, incidents } from "@/lib/opsData";
import { Brain } from "lucide-react";

export const Route = createFileRoute("/operations/incidents")({
  component: IncidentsPage,
});

function IncidentsPage() {
  const [appId, setAppId] = useState("");
  useEffect(() => setAppId(getSelectedAppId()), []);
  if (!appId) return null;
  const rows = incidents(appId);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { l: "Open", v: rows.filter((r) => r.open).length, t: "text-warning" },
          { l: "Critical", v: rows.filter((r) => r.severity === "Critical").length, t: "text-danger" },
          { l: "Systems Affected", v: rows.reduce((s, r) => s + r.affected, 0), t: "text-primary" },
          { l: "MTTR (h)", v: "4.7", t: "text-info" },
        ].map((k) => (
          <GlassCard key={k.l} className="p-4">
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">{k.l}</div>
            <div className={`mt-2 text-2xl font-display font-semibold ${k.t}`}>{k.v}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <SectionHeader title="Active & recent incidents" hint="AI-clustered by shared root cause" />
        <div className="space-y-3">
          {rows.map((i) => (
            <div key={i.id} className="p-4 rounded-xl bg-white/[0.02] border border-border/30">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                      i.severity === "Critical" ? "border-danger/40 text-danger bg-danger/10" :
                      i.severity === "High" ? "border-warning/40 text-warning bg-warning/10" :
                      i.severity === "Medium" ? "border-info/40 text-info bg-info/10" :
                      "border-success/40 text-success bg-success/10"
                    }`}>{i.severity}</span>
                    <span className="text-[10.5px] text-muted-foreground">{i.id}</span>
                    {i.open ? (
                      <span className="text-[10px] text-warning">● Open</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Resolved</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">{i.title}</div>
                  <div className="mt-2 text-[11.5px] text-primary/90 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" /> {i.rootCause}
                  </div>
                </div>
                <div className="text-right text-[11px] text-muted-foreground shrink-0">
                  <div>{i.affected} systems</div>
                  <div>{i.opened}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
