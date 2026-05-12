import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/platform/NotificationBell";
import { useLocation } from "@tanstack/react-router";

export function PlatformShell({
  sidebar, user, children, contextLabel,
}: {
  sidebar: React.ReactNode;
  user: { name: string; sub: string; initials: string };
  contextLabel?: string;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const bellTo = pathname.startsWith("/ngf") ? "/ngf/alerts" : "/state/alerts";
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        {sidebar}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            {contextLabel && (
              <span className="hidden rounded-full border bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground sm:inline">
                {contextLabel}
              </span>
            )}
            <div className="relative ml-2 hidden flex-1 max-w-sm md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search states, indicators, reports…" className="h-9 pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <div className="flex items-center gap-2 rounded-full border bg-card px-2 py-1 pr-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight sm:block">
                  <div className="text-xs font-semibold">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground">{user.sub}</div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
