import { ActivityIcon, LayoutDashboardIcon, MegaphoneIcon, ShieldCheckIcon, type LucideIcon } from "lucide-react";

/**
 * Sidebar and router both read this list. To add a page: create it in pages/, add an entry here,
 * and add its route in main.tsx.
 */
export interface NavItem { path: string; label: string; description: string; icon: LucideIcon }
export const NAV: NavItem[] = [
  { path: "/", label: "Overview", description: "How people use Gym Tracker.", icon: LayoutDashboardIcon },
  { path: "/campaigns", label: "Campaigns", description: "Delivery, creative, schedule, and sponsor reports.", icon: MegaphoneIcon },
  { path: "/events", label: "Events", description: "Every tracked event, with CSV export.", icon: ActivityIcon },
  { path: "/data", label: "Data quality", description: "Coverage and internal installs excluded from reports.", icon: ShieldCheckIcon },
];
