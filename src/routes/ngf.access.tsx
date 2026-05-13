import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

export const Route = createFileRoute("/ngf/access")({ component: AccessMatrix });

const ROLES = ["ngf_staff", "state_user"] as const;
const CAPABILITIES = [
  { key: "view_public", label: "View public site" },
  { key: "submit_surveys", label: "Submit surveys" },
  { key: "approve_surveys", label: "Approve submissions" },
  { key: "manage_users", label: "Manage users & roles" },
  { key: "publish_reports", label: "Publish reports" },
  { key: "manage_alerts", label: "Send alerts" },
  { key: "view_audit", label: "View audit log" },
  { key: "manage_grants", label: "Manage grants" },
  { key: "edit_state_data", label: "Edit own state data" },
];

const MATRIX: Record<string, Record<string, boolean>> = {
  ngf_staff: {
    view_public: true, submit_surveys: false, approve_surveys: true,
    manage_users: true, publish_reports: true, manage_alerts: true,
    view_audit: true, manage_grants: true, edit_state_data: false,
  },
  state_user: {
    view_public: true, submit_surveys: true, approve_surveys: false,
    manage_users: false, publish_reports: false, manage_alerts: false,
    view_audit: false, manage_grants: false, edit_state_data: true,
  },
};

function AccessMatrix() {
  const qc = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["access-users"],
    queryFn: async () => {
      const [{ data: rows }, { data: profiles }] = await Promise.all([
        supabase.from("user_roles").select("user_id, role, state_code, created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, title"),
      ]);
      return (rows ?? []).map((r: any) => {
        const p = (profiles ?? []).find((x: any) => x.id === r.user_id);
        return { ...r, full_name: p?.full_name ?? "—", title: p?.title ?? null };
      });
    },
  });

  const counts = useMemo(() => {
    const c = { ngf_staff: 0, state_user: 0 };
    for (const u of users as any[]) if (c[u.role as keyof typeof c] !== undefined) c[u.role as keyof typeof c] += 1;
    return c;
  }, [users]);

  const remove = async (user_id: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
    if (error) return toast.error(error.message);
    toast.success("Role revoked");
    qc.invalidateQueries({ queryKey: ["access-users"] });
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Role & access matrix" description="Who can do what across the platform" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Capability matrix</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Capability</th>
                {ROLES.map((r) => (
                  <th key={r} className="p-3 text-center">{r.replace("_", " ")} <span className="ml-1 font-display text-foreground">({counts[r as keyof typeof counts]})</span></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((cap) => (
                <tr key={cap.key} className="border-t">
                  <td className="p-3 font-medium">{cap.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="p-3 text-center">
                      {MATRIX[r][cap.key] ? <Check className="mx-auto h-4 w-4 text-[color:var(--success)]" /> : <X className="mx-auto h-4 w-4 text-muted-foreground/40" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Active assignments</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {users.map((u: any) => (
            <div key={`${u.user_id}-${u.role}`} className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="font-medium">{u.full_name} {u.title && <span className="text-xs text-muted-foreground">· {u.title}</span>}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={u.role === "ngf_staff" ? "default" : "secondary"} className="text-[10px]">{u.role}</Badge>
                  {u.state_code && <Badge variant="outline" className="text-[10px]">{u.state_code}</Badge>}
                  <span>since {new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(u.user_id, u.role)}>Revoke</Button>
            </div>
          ))}
          {!users.length && <div className="p-6 text-center text-sm text-muted-foreground">No role assignments yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
