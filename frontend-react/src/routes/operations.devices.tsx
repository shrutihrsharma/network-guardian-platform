import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GlassCard } from "@/components/ui-kit";
import { deviceInventory, getSelectedAppId } from "@/lib/opsData";

export const Route = createFileRoute("/operations/devices")({
  component: DevicesPage,
});

function DevicesPage() {
  const [appId, setAppId] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => setAppId(getSelectedAppId()), []);
  const rows = useMemo(() => (appId ? deviceInventory(appId) : []), [appId]);
  const filtered = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) || r.type.toLowerCase().includes(q.toLowerCase()));

  if (!appId) return null;
  return (
    <div className="mt-6 space-y-4">
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-border/40">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search devices, types…"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </GlassCard>
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                {["Device", "Type", "Vendor", "Firmware", "Status", "Cert Expiry", "EOS", "Patch", "Last Seen"].map((h) => (
                  <th key={h} className="text-left font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-border/25 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="text-foreground font-medium">{d.name}</div>
                    <div className="text-[10.5px] text-muted-foreground">{d.id}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.vendor}</td>
                  <td className="px-4 py-3 text-foreground">{d.firmware}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10.5px] px-2 py-0.5 rounded-full border ${
                      d.status === "Healthy" ? "border-success/40 text-success bg-success/10" :
                      d.status === "Degraded" ? "border-warning/40 text-warning bg-warning/10" :
                      "border-danger/40 text-danger bg-danger/10"
                    }`}>{d.status}</span>
                  </td>
                  <td className={`px-4 py-3 ${d.certExpiryDays < 30 ? "text-warning" : "text-muted-foreground"}`}>
                    {d.certExpiryDays < 0 ? "Expired" : `${d.certExpiryDays}d`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.eosDate}</td>
                  <td className="px-4 py-3">
                    <span className={d.patch === "Current" ? "text-success" : "text-warning"}>{d.patch}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{d.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
