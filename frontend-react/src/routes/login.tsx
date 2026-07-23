import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LockKeyhole, Network } from "lucide-react";
import { authenticateWithGoogle, getUser } from "@/lib/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Network Guardian" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const googleButton = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getUser()) {
      void navigate({ to: "/dashboard" });
      return;
    }

    const initialize = () => {
      if (!window.google || !googleButton.current) return false;

      window.google.accounts.id.initialize({
        client_id:
          import.meta.env.VITE_GOOGLE_CLIENT_ID ||
          "538280619310-t9e2gk2aval91ek5badi0hsc6471rsn8.apps.googleusercontent.com",
        callback: ({ credential }) => {
          setLoading(true);
          setError(null);
          try {
            authenticateWithGoogle(credential);
            void navigate({ to: "/dashboard" });
          } catch (authError) {
            setError(authError instanceof Error ? authError.message : "Authentication failed.");
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: "filled_black",
        size: "large",
        width: 360,
        text: "signin_with",
      });
      return true;
    };

    if (initialize()) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    document.head.appendChild(script);
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gold-gradient text-primary-foreground">
          <Network className="h-7 w-7" />
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.22em] text-primary">Platform · v2.0</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to access your network intelligence dashboard.</p>
        <div className="mt-8 flex min-h-11 justify-center" ref={googleButton} />
        {loading && <p className="mt-4 text-sm text-muted-foreground">Signing you in...</p>}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5 text-primary" /> Secured with Google OAuth 2.0
        </p>
      </section>
    </main>
  );
}