import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/ngf/inbox")({ component: Inbox });

function Inbox() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const markHandled = async (id: string, handled: boolean) => {
    const { error } = await supabase.from("contact_messages").update({ handled }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["contact_messages"] });
  };

  const unread = (rows as any[]).filter((r) => !r.handled).length;

  return (
    <div className="space-y-6">
      <SectionHeader title="Public Inbox" description={`Contact-form submissions from the marketing site${unread ? ` · ${unread} open` : ""}`} />
      <div className="grid gap-3">
        {(rows as any[]).map((m) => (
          <Card key={m.id} className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{m.name}</span>
                    {m.organisation && <span className="text-xs text-muted-foreground">· {m.organisation}</span>}
                    <Badge variant="outline" className="ml-auto md:ml-0">{m.topic}</Badge>
                    {m.handled && <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)]">Handled</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a> · {new Date(m.created_at).toLocaleString()}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
                </div>
                <Button size="sm" variant={m.handled ? "outline" : "default"} onClick={() => markHandled(m.id, !m.handled)}>
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{m.handled ? "Reopen" : "Mark handled"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No messages yet.</CardContent></Card>}
      </div>
    </div>
  );
}
