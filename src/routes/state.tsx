import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { PlatformSidebar } from "@/components/platform/PlatformSidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, FileSpreadsheet, Database, Users, Bell,
  Settings, BookOpen, Activity, MessageSquare, Lightbulb, Target, FolderUp,
} from "lucide-react";

export const Route = createFileRoute("/state")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
  },
  component: StateLayout,
});

function StateLayout() {
  return (
    <PlatformShell
      contextLabel="Kaduna State · PRS Department"
      user={{ name: "Aisha Mohammed", sub: "PRS Director, Kaduna", initials: "AM" }}
      sidebar={
        <PlatformSidebar
          brand="State Workspace"
          role="Kaduna State Government"
          groups={[
            {
              label: "Workspace",
              items: [
                { title: "Dashboard", url: "/state", icon: LayoutDashboard },
                { title: "Surveys", url: "/state/surveys", icon: FileSpreadsheet },
                { title: "State Profile", url: "/state/profile", icon: Database },
                { title: "Indicators", url: "/state/indicators", icon: Activity },
                { title: "Commitments", url: "/state/commitments", icon: Target },
                { title: "Evidence Vault", url: "/state/evidence", icon: FolderUp },
                { title: "Governor Report", url: "/state/report", icon: FileSpreadsheet },
              ],
            },
            {
              label: "Engagement",
              items: [
                { title: "Peer Benchmark", url: "/state/benchmark", icon: Users },
                { title: "Knowledge Hub", url: "/state/knowledge", icon: BookOpen },
                { title: "Innovation", url: "/state/innovation", icon: Lightbulb },
                { title: "Notifications", url: "/state/alerts", icon: Bell },
                { title: "Support", url: "/state/support", icon: MessageSquare },
              ],
            },
            { label: "Account", items: [{ title: "Settings", url: "/state/settings", icon: Settings }] },
          ]}
        />
      }
    >
      <Outlet />
    </PlatformShell>
  );
}
