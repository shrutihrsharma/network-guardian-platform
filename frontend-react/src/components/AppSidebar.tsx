import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  AppWindow,
  Sparkles,
  Compass,
  Bot,
  FlaskConical,
  CheckSquare,
  FileBarChart2,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: AppWindow },
  { to: "/risk-prediction", label: "AI Risk Prediction", icon: Sparkles },
  { to: "/compliance", label: "Compliance Explorer", icon: Compass },
  { to: "/copilot", label: "AI Copilot", icon: Bot },
  { to: "/simulator", label: "What-if Simulator", icon: FlaskConical },
  { to: "/decisions", label: "Decision Center", icon: CheckSquare },
  { to: "/reports", label: "Executive Reports", icon: FileBarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col z-40 border-r border-border/40 bg-sidebar/70 backdrop-blur-xl">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <img
          src="/assets/logo.svg"
          alt="Sentinel AI logo"
          className="h-10 w-10 rounded-xl object-contain"
        />
        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-wide text-foreground truncate">
            Sentinel AI
          </div>
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-gold-gradient font-medium">
            PLATFORM · V2.0
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
        Workspace
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {nav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
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
                  layoutId="side-active"
                  className="absolute inset-0 rounded-lg ring-1 ring-primary/30 bg-primary/[0.06]"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                className={`h-4 w-4 shrink-0 relative z-10 ${active ? "text-primary" : ""}`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="relative z-10 truncate">{item.label}</span>
              {active && (
                <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px] shadow-primary/60" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 p-3 rounded-xl glass">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px] shadow-success/60" />
          AI Engine Online
        </div>
        <div className="mt-1 text-xs text-foreground/90">Model: cic-forecaster · v4.1</div>
        <div className="text-[10.5px] text-muted-foreground mt-0.5">Confidence 97% · 24 sources</div>
      </div>
    </aside>
  );
}
