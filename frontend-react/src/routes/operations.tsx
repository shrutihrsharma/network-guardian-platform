import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Server,
  AlertOctagon,
  Clock,
  ShieldCheck,
  Sparkles,
  History,
  Settings2,
  ArrowLeft,
  Network,
  ChevronDown,
} from "lucide-react";
import { getApp, getSelectedAppId, opsApps, setSelectedAppId } from "@/lib/opsData";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/operations")({
  beforeLoad: () => {
    if (!getUser()) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Operational Intelligence — Compliance Sentinel AI" },
      {
        name: "description",
        content:
          "Network Guardian operational workspace for application owners: devices, incidents, lifecycle, compliance, and predictive risk.",
      },
    ],
  }),
  component: OperationsLayout,
});

const opsNav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/operations", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/operations/devices", label: "Devices", icon: Server },
  { to: "/operations/incidents", label: "Incidents", icon: AlertOctagon },
  { to: "/operations/lifecycle", label: "Lifecycle", icon: Clock },
  { to: "/operations/compliance", label: "Compliance", icon: ShieldCheck },
  { to: "/operations/predictive", label: "Predictive Risk", icon: Sparkles },
  { to: "/operations/decisions", label: "Decision History", icon: History },
  { to: "/operations/settings", label: "Settings", icon: Settings2 },
];

function OperationsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [appId, setAppId] = useState<string>(() => (typeof window !== "undefined" ? getSelectedAppId() : opsApps[0].id));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAppId(getSelectedAppId());
  }, []);

  const app = getApp(appId);

  const change = (id: string) => {
    setAppId(id);
    setSelectedAppId(id);
    setOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Ops sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col z-40 border-r border-border/40 bg-sidebar/70 backdrop-blur-xl">
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-xl gold-gradient shadow-lg shadow-black/30">
            <Network className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold tracking-wide text-foreground truncate">
              Network Guardian
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-gold-gradient font-medium">
              Operational · v2.4
            </div>
          </div>
        </div>

        <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
          Workspace
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {opsNav.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "text-foreground bg-sidebar-accent/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="ops-active"
                    className="absolute inset-0 rounded-lg ring-1 ring-primary/30 bg-primary/[0.06]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon className={`h-4 w-4 shrink-0 relative z-10 ${active ? "text-primary" : ""}`} strokeWidth={active ? 2.4 : 2} />
                <span className="relative z-10 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/dashboard"
          className="m-3 p-3 rounded-xl glass flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Executive Portal
        </Link>
      </aside>

      <main className="lg:pl-64 px-6 lg:px-8 pb-16">
        {/* Application context selector */}
        <div className="sticky top-0 z-30 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 backdrop-blur-xl bg-background/60 border-b border-border/40 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
              Operational Context
            </div>
            <div className="relative mt-0.5 inline-block">
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 text-lg sm:text-xl font-semibold tracking-tight text-foreground hover:text-primary transition"
              >
                {app.name}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
              {open && (
                <div className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto scrollbar-thin rounded-xl glass border border-border/50 z-40 py-1.5 shadow-2xl">
                  {opsApps.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => change(a.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/[0.04] ${
                        a.id === appId ? "text-primary" : "text-foreground/90"
                      }`}
                    >
                      <div className="font-medium">{a.name}</div>
                      <div className="text-[10.5px] text-muted-foreground">{a.bu} · {a.owner}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {app.bu} · Owner {app.owner} · Network Guardian AI online
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px] shadow-success/60" />
            Model: guardian-ops · v3.2
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
