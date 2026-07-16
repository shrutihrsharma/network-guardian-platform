import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Cpu, Database, Lock, Palette, Sparkles, User } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/ui-kit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Compliance Sentinel AI" },
      { name: "description", content: "Platform, AI model, notifications, and access settings." },
    ],
  }),
  component: SettingsPage,
});

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "ai", label: "AI Engine", icon: Cpu },
  { id: "sources", label: "Data Sources", icon: Database },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function SettingsPage() {
  const [active, setActive] = useState("ai");
  const [confidence, setConfidence] = useState(85);

  return (
    <>
      <TopBar title="Settings" subtitle="Platform configuration, AI engine, and integrations" />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <GlassCard className="p-3 h-fit">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  active === s.id
                    ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </GlassCard>

        <GlassCard className="p-6" strong>
          {active === "ai" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI Engine
                </div>
                <h2 className="mt-1 text-lg font-semibold text-foreground">Compliance Forecaster</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tune how the model prioritizes risk, explains reasoning, and requests approvals.
                </p>
              </div>

              <Row label="Active model" hint="Latest fine-tuned enterprise forecaster">
                <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-border/40 text-sm text-foreground">
                  cic-forecaster · v4.1
                </div>
              </Row>

              <Row label="Auto-approve threshold" hint={`Actions above ${confidence}% AI confidence are auto-executed`}>
                <div className="w-full">
                  <input
                    type="range"
                    min={60}
                    max={99}
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full accent-[oklch(0.82_0.14_88)]"
                  />
                  <div className="mt-1 text-xs text-gold-gradient font-semibold">{confidence}%</div>
                </div>
              </Row>

              <Row label="Reasoning depth" hint="Balance explainability vs. speed">
                <div className="flex gap-2">
                  {["Fast", "Balanced", "Deep"].map((m, i) => (
                    <button
                      key={m}
                      className={`px-3 py-1.5 rounded-lg text-xs border ${
                        i === 1 ? "gold-gradient text-primary-foreground border-transparent" : "bg-white/[0.03] border-border/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Row>

              <Row label="Include explainability panels" hint="Show 'Why?' reasoning on every prediction">
                <Toggle defaultOn />
              </Row>

              <Row label="Human-in-the-loop for Tier-1 apps" hint="Always require approval for critical apps">
                <Toggle defaultOn />
              </Row>
            </div>
          )}

          {active !== "ai" && (
            <div className="min-h-[300px] grid place-items-center text-center">
              <div>
                <div className="h-14 w-14 rounded-2xl gold-gradient grid place-items-center text-primary-foreground mx-auto">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="mt-4 text-sm font-medium text-foreground">
                  {sections.find((s) => s.id === active)?.label} settings
                </div>
                <div className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Configure this section from your enterprise admin console. Changes sync to all workspaces.
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 py-3 border-t border-border/30 first:border-t-0 first:pt-0">
      <div className="md:w-64 shrink-0">
        <div className="text-sm text-foreground">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 rounded-full transition ${on ? "gold-gradient" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
