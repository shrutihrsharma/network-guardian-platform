import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard, SectionHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/operations/settings")({
  component: OpsSettingsPage,
});

function OpsSettingsPage() {
  const [failureThreshold, setFailureThreshold] = useState(65);
  const [riskTolerance, setRiskTolerance] = useState<"Low" | "Balanced" | "High">("Balanced");
  const [alerts, setAlerts] = useState({ email: true, slack: true, pager: false, servicenow: true });

  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-4">
      <GlassCard className="p-5">
        <SectionHeader title="AI thresholds" hint="Auto-approve behavior for guardian-ops" />
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Failure probability alert threshold</span>
            <span className="text-foreground">{failureThreshold}%</span>
          </div>
          <input
            type="range" min={30} max={95}
            value={failureThreshold}
            onChange={(e) => setFailureThreshold(Number(e.target.value))}
            className="w-full accent-[oklch(0.82_0.14_88)]"
          />
          <p className="text-[11px] text-muted-foreground mt-2">
            Predictions above this threshold trigger an alert and enter the Decision Center automatically.
          </p>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionHeader title="Risk tolerance" hint="Guides recommendation aggressiveness" />
        <div className="flex gap-2 mt-2">
          {(["Low", "Balanced", "High"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setRiskTolerance(t)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition ${
                riskTolerance === t ? "border-primary/50 text-primary bg-primary/10" : "border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 lg:col-span-2">
        <SectionHeader title="Notification rules" hint="Routing for AI alerts and remediation events" />
        <div className="grid md:grid-cols-2 gap-3">
          {(Object.keys(alerts) as (keyof typeof alerts)[]).map((k) => (
            <label key={k} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-border/30 cursor-pointer">
              <span className="text-sm text-foreground capitalize">{k === "servicenow" ? "ServiceNow" : k}</span>
              <input
                type="checkbox"
                checked={alerts[k]}
                onChange={(e) => setAlerts({ ...alerts, [k]: e.target.checked })}
                className="accent-[oklch(0.82_0.14_88)] h-4 w-4"
              />
            </label>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
