import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";

import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/ui-kit";
import { copilotReply, copilotSuggestions } from "@/lib/mockData";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot — Compliance Sentinel AI" },
      { name: "description", content: "Conversational AI copilot for enterprise compliance risk." },
    ],
  }),
  component: CopilotPage,
});

type Msg = { role: "user" | "ai"; text: string };

function CopilotPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Good morning. I'm your Compliance Sentinel AI. Ask me about predicted risks, remediation plans, or executive reports.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: copilotReply(text) }]);
      setThinking(false);
    }, 700);
  };

  return (
    <>
      <TopBar title="AI Copilot" subtitle="cic-forecaster · v4.1 · reasoning over 24 enterprise signal sources" />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <GlassCard className="flex flex-col h-[calc(100vh-190px)] min-h-[520px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${
                    m.role === "user"
                      ? "bg-white/5 text-muted-foreground"
                      : "gold-gradient text-primary-foreground"
                  }`}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary/15 text-foreground border border-primary/25"
                      : "bg-white/[0.03] text-foreground/90 border border-border/40"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gold-gradient font-semibold">$1</strong>')
                      .replace(/`(.+?)`/g, '<code class="text-primary bg-primary/10 rounded px-1">$1</code>'),
                  }}
                />
              </motion.div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg gold-gradient grid place-items-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-white/[0.03] border border-border/40 rounded-2xl px-4 py-3 text-sm flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.3s]" />
                  <span className="ml-2 text-muted-foreground text-xs">Reasoning…</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/40 p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 rounded-xl bg-white/[0.03] border border-border/50 focus-within:ring-1 focus-within:ring-primary/50 transition">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask about predicted risks, remediation plans, CAB recommendations…"
                  className="w-full bg-transparent outline-none text-sm px-3 py-3 resize-none max-h-32"
                />
              </div>
              <button
                onClick={() => send(input)}
                className="h-10 w-10 grid place-items-center rounded-xl gold-gradient text-primary-foreground shadow-lg shadow-black/20 hover:opacity-95 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" /> Suggested prompts
          </div>
          <div className="space-y-2">
            {copilotSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/[0.02] border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition text-foreground/90"
              >
                {s}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
