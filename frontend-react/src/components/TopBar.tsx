import { Bell, Search, Command } from "lucide-react";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
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

      <div className="flex items-center gap-2.5 pl-2">
        <div className="h-9 w-9 rounded-full gold-gradient grid place-items-center text-primary-foreground text-xs font-bold shadow-lg shadow-black/30">
          DB
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="text-xs font-medium text-foreground">D. Bergmann</div>
          <div className="text-[10px] text-muted-foreground">Chief Risk Officer</div>
        </div>
      </div>
    </div>
  );
}
