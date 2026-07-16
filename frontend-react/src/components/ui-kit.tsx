import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  strong,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div className={`${strong ? "glass-strong" : "glass"} rounded-2xl ${className}`}>{children}</div>
  );
}

export function RiskBadge({ level }: { level: "Critical" | "High" | "Medium" | "Low" }) {
  const map = {
    Critical: "bg-danger/15 text-danger border-danger/30",
    High: "bg-warning/15 text-warning border-warning/30",
    Medium: "bg-info/15 text-info border-info/30",
    Low: "bg-success/15 text-success border-success/30",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${map[level]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

export function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
