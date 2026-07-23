import { useEffect, useState } from "react";
import { Bell, Search, Command, ChevronDown, LogOut } from "lucide-react";
import { getUser, logout, type UserProfile } from "@/lib/auth";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const initials = (user?.name || user?.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sticky top-0 z-30 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 backdrop-blur-xl bg-background/60 border-b border-border/40 flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg glass w-72">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          placeholder="Search apps, findings, controls…"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground/70"
        />
        <kbd className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
          <Command className="h-2.5 w-2.5" /> K
        </kbd>
      </div>

      <button className="relative h-9 w-9 grid place-items-center rounded-lg glass hover:ring-gold transition-shadow">
        <Bell className="h-4 w-4 text-foreground/90" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60" />
      </button>

      <div className="relative pl-2">
        <button
          type="button"
          aria-expanded={accountOpen}
          aria-haspopup="menu"
          onClick={() => setAccountOpen((open) => !open)}
          className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2 py-1.5 text-left hover:border-primary/50 transition-colors"
        >
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name || "Logged-in user"}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-full gold-gradient text-xs font-bold text-primary-foreground shadow-lg shadow-black/30">
              {initials}
            </div>
          )}
          <span className="hidden max-w-40 leading-tight sm:block">
            <span className="block truncate text-xs font-medium text-foreground">
              {user?.name || "User"}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {user?.email || "Authenticated account"}
            </span>
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${accountOpen ? "rotate-180" : ""}`} />
        </button>

        {accountOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
              {user?.picture ? (
                <img src={user.picture} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{user?.name || "User"}</div>
                <div className="truncate text-xs text-muted-foreground">{user?.email || "Authenticated account"}</div>
              </div>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
