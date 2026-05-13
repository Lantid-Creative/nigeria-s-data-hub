import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { PlatformSidebar } from "@/components/platform/PlatformSidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, BarChart3, MapPin, Telescope, FlaskConical,
  FileText, Lightbulb, Bell, Shield, Settings, Database, GitBranch, Users, Inbox, Activity,
  Brain, MessageCircle, AlertTriangle, Eye, DollarSign, Handshake, Newspaper, Send,
} from "lucide-react";

export const Route = createFileRoute("/ngf")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", session.user.id);
    if (!(roles ?? []).some((r) => r.role === "ngf_staff")) throw redirect({ to: "/state" });
  },
  component: NgfLayout,
});

function NgfLayout() {
  return (
    <PlatformShell
      contextLabel="NGF Secretariat · Economic Intelligence Unit"
      user={{ name: "Dr. O. Yinusa", sub: "ED, Policy & Research", initials: "OY" }}
      sidebar={
        <PlatformSidebar
          brand="NGF Command Centre"
          role="Futures Lab"
          groups={[
            {
              label: "Intelligence",
              items: [
                { title: "Overview", url: "/ngf", icon: LayoutDashboard },
                { title: "Daily Briefing", url: "/ngf/briefing", icon: Brain },
                { title: "Ask the Data", url: "/ngf/askdata", icon: MessageCircle },
                { title: "Analytics", url: "/ngf/analytics", icon: BarChart3 },
                { title: "States", url: "/ngf/states", icon: MapPin },
                { title: "SNRI", url: "/ngf/snri", icon: Shield },
              ],
            },
            {
              label: "Foresight & Innovation",
              items: [
                { title: "Scenario Planning", url: "/ngf/foresight", icon: Telescope },
                { title: "Saved Scenarios", url: "/ngf/scenarios", icon: Sparkles },
                { title: "Horizon Scan", url: "/ngf/horizon", icon: Eye },
                { title: "Risk Register", url: "/ngf/risks", icon: AlertTriangle },
                { title: "Research Lab", url: "/ngf/research", icon: FlaskConical },
                { title: "Innovation Pilots", url: "/ngf/innovation", icon: Lightbulb },
              ],
            },
            {
              label: "Stakeholders",
              items: [
                { title: "Governor Engagement", url: "/ngf/engagement", icon: Handshake },
                { title: "Press Monitor", url: "/ngf/press", icon: Newspaper },
                { title: "Grants & Partners", url: "/ngf/grants", icon: DollarSign },
                { title: "Public Inbox", url: "/ngf/inbox", icon: Inbox },
              ],
            },
            {
              label: "Operations",
              items: [
                { title: "Reports", url: "/ngf/reports", icon: FileText },
                { title: "Data Hub", url: "/ngf/data", icon: Database },
                { title: "Survey Engine", url: "/ngf/surveys", icon: GitBranch },
                { title: "Alerts", url: "/ngf/alerts", icon: Bell },
                { title: "Publish Queue", url: "/ngf/publish", icon: Send },
                { title: "Users & Roles", url: "/ngf/users", icon: Users },
                { title: "Audit Log", url: "/ngf/audit", icon: Activity },
                { title: "Settings", url: "/ngf/settings", icon: Settings },
              ],
            },
          ]}
        />
      }
    >
      <Outlet />
    </PlatformShell>
  );
}
