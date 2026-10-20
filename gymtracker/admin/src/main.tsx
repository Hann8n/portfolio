import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, StrictMode, Suspense, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AppLayout } from "./app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmptyState, LoadingGrid } from "@/components/states";
import { ApiError } from "@/lib/api";
import { ThemeProvider } from "@/lib/theme";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: true, retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2 } },
});

/** Each page loads on first visit, so the overview does not wait for the editor or tables. */
function page<M extends Record<K, ComponentType>, K extends keyof M>(load: () => Promise<M>, name: K) {
  const Page = lazy(async () => ({ default: (await load())[name] as ComponentType }));
  return <Suspense fallback={<LoadingGrid />}><Page /></Suspense>;
}

// Routes mirror lib/nav.ts. The Worker serves this app for every /admin path after Cloudflare Access.
const router = createBrowserRouter([{
  path: "/", element: <AppLayout />,
  children: [
    { index: true, element: page(() => import("@/pages/overview"), "OverviewPage") },
    { path: "campaigns", element: page(() => import("@/pages/campaigns"), "CampaignsPage") },
    { path: "campaigns/:id", element: page(() => import("@/pages/campaign-detail"), "CampaignDetailPage") },
    { path: "events", element: page(() => import("@/pages/events"), "EventsPage") },
    { path: "data", element: page(() => import("@/pages/data-quality"), "DataQualityPage") },
    { path: "*", element: <EmptyState>Page not found.</EmptyState> },
  ],
}], { basename: "/admin" });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider><RouterProvider router={router} /></TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
