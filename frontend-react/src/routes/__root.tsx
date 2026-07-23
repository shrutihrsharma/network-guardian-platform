import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppSidebar } from "@/components/AppSidebar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
          <h1 className="text-7xl font-bold text-gold-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md gold-gradient px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or return to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md gold-gradient px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go home 
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Compliance Sentinel AI — Predict. Prevent. Prioritize." },
      {
        name: "description",
        content:
          "Enterprise AI platform that predicts compliance risks before they become audit failures. Turn reactive compliance into a predictive, prioritized program.",
      },
      { name: "author", content: "Compliance Intelligence" },
      { property: "og:title", content: "Compliance Sentinel AI — Predict. Prevent. Prioritize." },
      {
        property: "og:description",
        content: "Enterprise AI platform that predicts compliance risks before they become audit failures. Turn reactive compliance into a predictive, prioritized program.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Compliance Sentinel AI — Predict. Prevent. Prioritize." },
      { name: "twitter:description", content: "Enterprise AI platform that predicts compliance risks before they become audit failures. Turn reactive compliance into a predictive, prioritized program." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f2f4a0c-cb9d-423f-a66a-d3bbc94ffaf8/id-preview-769ba75a--4e8c743d-3018-4c73-b9fa-dd0c061c7371.lovable.app-1783992457050.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f2f4a0c-cb9d-423f-a66a-d3bbc94ffaf8/id-preview-769ba75a--4e8c743d-3018-4c73-b9fa-dd0c061c7371.lovable.app-1783992457050.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/sentinel-ai.svg?v=2", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLanding = pathname === "/";
  const isOps = pathname === "/operations" || pathname.startsWith("/operations/");
  const hideChrome = isLanding || isOps;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full text-foreground">
        {!hideChrome && <AppSidebar />}
        <main className={`${hideChrome ? "" : "lg:pl-64"} min-h-screen`}>
          <div className={hideChrome ? "" : "px-6 lg:px-8 pb-16"}>
            <Outlet />
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
