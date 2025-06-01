
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, CalendarDays, Settings2, type LucideIcon } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/history", label: "History", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              className={cn(
                "font-mono text-sm", 
                "hover:bg-primary/20 hover:text-accent-foreground",
                pathname === item.href
                  ? "bg-primary/30 text-accent-foreground font-semibold shadow-inner"
                  : "text-sidebar-foreground"
              )}
              isActive={pathname === item.href}
              tooltip={{ children: item.label, className: "font-mono glassmorphic" }}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                {item.label}
              </span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
