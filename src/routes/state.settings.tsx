import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/state/settings")({ component: Settings });

function Settings() {
  const { profile, user, roles, stateCode, refresh, signOut } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setTitle(profile?.title ?? "");
  }, [profile]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, title }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refresh();
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Workspace and account preferences" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div>
              <Label>State</Label>
              <Input value={stateCode ?? "—"} disabled />
            </div>
            <div>
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. PRS Director" />
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="bg-primary">Save changes</Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Roles</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          {roles.map((r, i) => (
            <div key={i} className="flex justify-between border-b py-1.5 last:border-0">
              <span className="capitalize">{r.role.replace("_", " ")}</span>
              <span className="text-muted-foreground">{r.state_code ?? "—"}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <div className="font-medium">Sign out</div>
            <div className="text-xs text-muted-foreground">End your session on this device.</div>
          </div>
          <Button variant="outline" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
