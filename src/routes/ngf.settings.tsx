import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/ngf/settings")({ component: Settings });

function Settings() {
  const { user, signOut } = useAuth();
  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Account and workspace preferences" />
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="font-display text-lg">Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm"><span className="text-muted-foreground">Signed in as: </span><span className="font-medium">{user?.email}</span></div>
          <Button variant="outline" onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
