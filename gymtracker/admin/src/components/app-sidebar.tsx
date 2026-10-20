import { MoonIcon, SunIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar,
} from "@/components/ui/sidebar";
import { NAV } from "@/lib/nav";
import { useTheme } from "@/lib/theme";

export function AppSidebar() {
  const { pathname, search } = useLocation();
  const { setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const dark = document.documentElement.classList.contains("dark");
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to={{ pathname: "/", search }}>
                <img src="/favicon/apple-touch-icon.png" alt="" className="size-8 rounded-lg" />
                <div className="grid text-left leading-tight">
                  <span className="truncate font-semibold">Gym Tracker</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(item => {
                const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <NavLink to={{ pathname: item.path, search }} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Toggle theme" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={`Switch to ${dark ? "light" : "dark"} theme`} data-theme={theme}>
              {dark ? <SunIcon /> : <MoonIcon />}
              <span>{dark ? "Light theme" : "Dark theme"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="jackhannon.net">
              <a href="https://jackhannon.net/"><span className="text-xs text-muted-foreground">← jackhannon.net</span></a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
