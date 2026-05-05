import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import ngfLogo from "@/assets/ngf-logo.png";

export type NavItem = { title: string; url: string; icon: LucideIcon };

export function PlatformSidebar({
  brand, role, groups, footer,
}: {
  brand: string;
  role: string;
  groups: { label: string; items: NavItem[] }[];
  footer?: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <img src={ngfLogo} alt="Nigeria Governors' Forum" className="h-9 w-auto rounded bg-white object-contain p-0.5" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">{brand}</span>
            <span className="truncate text-[10px] uppercase tracking-wider text-sidebar-foreground/60">{role}</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.url === pathname ||
                    (item.url !== "/" && pathname.startsWith(item.url + "/"));
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {footer && <SidebarFooter className="border-t border-sidebar-border">{footer}</SidebarFooter>}
    </Sidebar>
  );
}
