import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/platform/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStateCode } from "@/lib/state-data";
import { useAuth } from "@/lib/auth";
import { logEvent } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";

export const Route = createFileRoute("/state/support")({ component: Support });

function Support() {
  const code = useStateCode();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMsg, setNewMsg] = useState("");

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets", code],
    queryFn: async () => {
      const { data, error } = await supabase.from("support_tickets").select("*").eq("state_code", code).order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["ticket-msgs", active],
    enabled: !!active,
    queryFn: async () => {
      const { data, error } = await supabase.from("ticket_messages").select("*").eq("ticket_id", active!).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const open = async () => {
    if (!newSubject.trim() || !newMsg.trim()) return toast.error("Subject and message required");
    const { data, error } = await supabase.from("support_tickets").insert({
      state_code: code, subject: newSubject, created_by: user?.id,
    }).select("id").single();
    if (error) return toast.error(error.message);
    await supabase.from("ticket_messages").insert({
      ticket_id: data.id, author_id: user?.id, author_role: "state", body: newMsg,
    });
    toast.success("Ticket opened");
    logEvent("ticket.open", "ticket", data.id, { state: code });
    setNewSubject(""); setNewMsg("");
    qc.invalidateQueries({ queryKey: ["tickets", code] });
    setActive(data.id);
  };

  const reply = async () => {
    if (!active || !draft.trim()) return;
    await supabase.from("ticket_messages").insert({
      ticket_id: active, author_id: user?.id, author_role: "state", body: draft,
    });
    await supabase.from("support_tickets").update({ updated_at: new Date().toISOString() }).eq("id", active);
    setDraft("");
    qc.invalidateQueries({ queryKey: ["ticket-msgs", active] });
    qc.invalidateQueries({ queryKey: ["tickets", code] });
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Support" description="Direct line to the NGF Futures Lab team" />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { i: Mail, l: "Email", v: "lab@ngf.org.ng" },
          { i: Phone, l: "Hotline", v: "+234 (0)9 461 0000" },
          { i: MessageSquare, l: "Office hours", v: "Mon–Fri, 09:00–17:00 WAT" },
        ].map((x) => (
          <Card key={x.l} className="shadow-soft">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary"><x.i className="h-5 w-5" /></div>
              <div><div className="text-xs uppercase tracking-wider text-muted-foreground">{x.l}</div><div className="font-medium">{x.v}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Your tickets</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 rounded-lg border p-3">
              <Label>New ticket</Label>
              <Input placeholder="Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
              <Textarea placeholder="Describe the issue…" rows={3} value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
              <Button onClick={open} className="w-full bg-primary">Open ticket</Button>
            </div>
            <div className="divide-y">
              {tickets.map((t: any) => (
                <button key={t.id} onClick={() => setActive(t.id)} className={`block w-full p-3 text-left text-sm transition hover:bg-muted/50 ${active === t.id ? "bg-muted/60" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{t.subject}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{t.status}</Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</div>
                </button>
              ))}
              {!tickets.length && <div className="p-3 text-center text-xs text-muted-foreground">No tickets yet.</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Conversation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!active && <div className="p-6 text-center text-sm text-muted-foreground">Select a ticket to view messages.</div>}
            {active && (
              <>
                <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
                  {messages.map((m: any) => (
                    <div key={m.id} className={`max-w-[80%] rounded-lg p-3 text-sm ${m.author_role === "state" ? "ml-auto bg-primary/10" : "bg-muted"}`}>
                      <div className="text-[10px] font-semibold uppercase opacity-60">{m.author_role}</div>
                      <div className="whitespace-pre-wrap">{m.body}</div>
                    </div>
                  ))}
                  {!messages.length && <div className="text-center text-xs text-muted-foreground">No messages.</div>}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Type your reply…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && reply()} />
                  <Button onClick={reply} className="bg-primary"><Send className="h-4 w-4" /></Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
