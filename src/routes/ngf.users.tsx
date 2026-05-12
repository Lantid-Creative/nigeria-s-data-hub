import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/ngf/users")({ component: UsersAdmin });

type AppRole = "ngf_staff" | "state_user" | "partner";

function UsersAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const profilesQ = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, title, state_code, avatar_url, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rolesQ = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("id, user_id, role, state_code");
      if (error) throw error;
      return data ?? [];
    },
  });

  const statesQ = useQuery({
    queryKey: ["admin-states"],
    queryFn: async () => {
      const { data } = await supabase.from("states").select("code, name").order("name");
      return data ?? [];
    },
  });

  const filtered = (profilesQ.data ?? []).filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.state_code?.toLowerCase().includes(q)
    );
  });

  async function addRole(userId: string, role: AppRole, stateCode: string | null) {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role,
      state_code: role === "state_user" ? stateCode : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Role assigned");
    qc.invalidateQueries({ queryKey: ["admin-roles"] });
  }

  async function removeRole(id: string) {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Role removed");
    qc.invalidateQueries({ queryKey: ["admin-roles"] });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="User Management"
        description="Assign platform roles to users and bind state users to a state."
      />

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Members</CardTitle>
          <Input
            placeholder="Search by name, state, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="w-[320px]">Assign role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const userRoles = (rolesQ.data ?? []).filter((r) => r.user_id === p.id);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.full_name || "—"}</div>
                      <div className="text-[11px] text-muted-foreground">{p.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell className="text-sm">{p.title ?? "—"}</TableCell>
                    <TableCell className="text-sm">{p.state_code ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userRoles.length === 0 && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                        {userRoles.map((r) => (
                          <Badge key={r.id} variant="secondary" className="gap-1 capitalize">
                            {r.role.replace("_", " ")}
                            {r.state_code ? ` · ${r.state_code}` : ""}
                            <button onClick={() => removeRole(r.id)} aria-label="Remove">
                              <Trash2 className="ml-1 h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AssignRoleForm
                        states={statesQ.data ?? []}
                        onAssign={(role, stateCode) => addRole(p.id, role, stateCode)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">Invite a member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            New users sign up at <span className="font-mono">/signup</span> and verify their email.
            Once they appear in the table above, assign their role here.
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/signup`}
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/signup`);
                toast.success("Signup link copied");
              }}
            >
              Copy link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssignRoleForm({
  states,
  onAssign,
}: {
  states: { code: string; name: string }[];
  onAssign: (role: AppRole, stateCode: string | null) => void;
}) {
  const [role, setRole] = useState<AppRole>("state_user");
  const [stateCode, setStateCode] = useState<string>("");

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
        <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ngf_staff">NGF Staff</SelectItem>
          <SelectItem value="state_user">State User</SelectItem>
          <SelectItem value="partner">Partner</SelectItem>
        </SelectContent>
      </Select>
      {role === "state_user" && (
        <Select value={stateCode} onValueChange={setStateCode}>
          <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            {states.map((s) => (
              <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button
        size="sm"
        onClick={() => {
          if (role === "state_user" && !stateCode) {
            toast.error("Pick a state");
            return;
          }
          onAssign(role, role === "state_user" ? stateCode : null);
        }}
      >
        <Plus className="mr-1 h-3.5 w-3.5" /> Add
      </Button>
    </div>
  );
}
