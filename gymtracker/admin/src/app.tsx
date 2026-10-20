import { useIsFetching } from "@tanstack/react-query";
import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { FiltersBar } from "@/components/filters-bar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

/** Shell: collapsible sidebar (a sheet on phones), sticky top bar with global filters, scrolling page body. */
export function AppLayout() {
  const fetching = useIsFetching();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <span className="hidden text-sm text-muted-foreground sm:inline" aria-live="polite">{fetching ? "Updating…" : "Eastern Time"}</span>
          <div className="ml-auto"><FiltersBar /></div>
        </header>
        <div id="page" className="mx-auto w-full max-w-7xl min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  );
}
