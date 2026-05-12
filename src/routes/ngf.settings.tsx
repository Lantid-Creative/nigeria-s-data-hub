import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Upload } from "lucide-react";

export const Route = createFileRoute("/ngf/settings")({ component: Settings });

function Settings() {
  const { profile, user, roles, refresh, signOut } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function uploadAvatar(file: File) {
    if (!user) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Max 2 MB");
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Avatar updated");
    refresh();
  }

  async function changePassword() {
    if (password.length < 8) return toast.error("Minimum 8 characters");
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPwSaving(false);
    if (error) return toast.error(error.message);
    setPassword("");
    toast.success("Password updated");
  }

  const initials = (fullName || user?.email || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Account and workspace preferences" />

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Change avatar"}
              </Button>
              <div className="mt-1 text-[11px] text-muted-foreground">JPG or PNG, up to 2 MB</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
            <div><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Director, Policy & Research" /></div>
          </div>
          <Button onClick={save} disabled={saving} className="bg-primary">Save changes</Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Password</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="newpw">New password</Label>
              <Input id="newpw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div className="flex items-end">
              <Button onClick={changePassword} disabled={pwSaving || !password}>
                {pwSaving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </div>
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
